from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal, ReportModel
# ... include your CORS setup here ...

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    return db.query(ReportModel).all() # 

@app.post("/reports")
def create_report(lat: float, lng: float, severity: str, db: Session = Depends(get_db)):
    # Note: image_data can be added here once Rajdeep handles the photo capture [cite: 18]
    new_report = ReportModel(lat=lat, lng=lng, severity=severity)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@app.patch("/reports/{report_id}/claim")
def claim_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Spot not found")
    report.status = "In Progress" # 
    db.commit()
    return report