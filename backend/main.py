from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from .database import SessionLocal, ReportModel, engine, Base

# Initialize app and create tables
Base.metadata.create_all(bind=engine)
app = FastAPI()

# CRITICAL: CORS setup for Rajdeep's frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. UPDATED: Pydantic model to include description and match frontend casing
class ReportCreate(BaseModel):
    lat: float
    lng: float
    severity: str # Expected: "low", "medium", "high" [cite: 18, 19]
    desc: Optional[str] = None # Added to match Rajdeep's "report.desc"
    image_data: Optional[str] = None # For Base64 photos [cite: 18]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    """Returns all spots for the Map View [cite: 19]"""
    return db.query(ReportModel).all()

@app.post("/reports")
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    """Handles 'Report a Spot' flow [cite: 18]"""
    # Ensure status is lowercase to match frontend filters
    new_report = ReportModel(
        lat=report.lat, 
        lng=report.lng, 
        severity=report.severity.lower(),
        status="reported", # Lowercase to match Rajdeep's filter
        desc=report.desc,
        image_data=report.image_data
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@app.patch("/reports/{report_id}/claim")
def claim_report(report_id: int, db: Session = Depends(get_db)):
    """Changes status to 'in-progress' for Volunteer Action """
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Spot not found")
    
    # Updated to 'in-progress' (hyphenated) to match frontend filter logic
    report.status = "in-progress" 
    db.commit()
    return report

# 2. REQUIRED: Dashboard Counts [cite: 21]
@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Basic status dashboard counts for the header [cite: 21]"""
    return {
        "total": db.query(ReportModel).count(),
        "in_progress": db.query(ReportModel).filter(ReportModel.status == "in-progress").count(),
        "cleaned": db.query(ReportModel).filter(ReportModel.status == "cleaned").count()
    }

@app.on_event("startup")
def seed_db():
    """MVE: Pre-load 5 reports with real coordinates for judges [cite: 26, 27]"""
    db = SessionLocal()
    if db.query(ReportModel).count() == 0:
        # Lowercase severity and status used to ensure UI colors/filters work [cite: 19]
        dummy_spots = [
            ReportModel(lat=12.8231, lng=80.0442, severity="high", status="reported", desc="Large pile near gate"),
            ReportModel(lat=12.8250, lng=80.0410, severity="medium", status="in-progress", desc="Littering on sidewalk"),
            ReportModel(lat=12.8210, lng=80.0450, severity="low", status="reported", desc="Small plastic waste"),
            ReportModel(lat=12.8265, lng=80.0435, severity="high", status="reported", desc="Industrial dumping"),
            ReportModel(lat=12.8242, lng=80.0461, severity="medium", status="cleaned", desc="Overflowing dumpster"),
        ]
        db.add_all(dummy_spots)
        db.commit()
    db.close()