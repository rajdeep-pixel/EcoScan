import uvicorn
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager

from database import SessionLocal, ReportModel, User, engine, Base


# --- 1. REAL-TIME WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()


# --- 2. TRANSLATION MAP ---
TRANSLATIONS = {
    "hindi": {
        "reported": "रिपोर्ट किया गया",
        "in-progress": "काम जारी है",
        "pending-proof": "प्रमाण लंबित",
        "cleaned": "साफ़ किया गया",
        "low": "कम",
        "medium": "मध्यम",
        "high": "उच्च"
    }
}

# Severity-based scoring
POINT_MAP = {"low": 10, "medium": 25, "high": 50}


# --- 3. LIFESPAN (DB setup + seed) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add_all([
                User(name="Rajdeep", total_score=150, cleanup_count=4),
                User(name="Tulsi", total_score=120, cleanup_count=3),
                User(name="Shreyas", total_score=90, cleanup_count=2),
            ])
            db.commit()
            print("✅ Seeded initial volunteers.")
    finally:
        db.close()
    yield


app = FastAPI(title="EcoScan API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 4. SCHEMAS ---
class ReportCreate(BaseModel):
    lat: float
    lng: float
    severity: str
    desc: Optional[str] = None
    landmark: Optional[str] = None
    image_data: Optional[str] = None
    reporter_name: Optional[str] = "Anonymous"


class ReportClaim(BaseModel):
    volunteer_name: str


class ReportClean(BaseModel):
    after_image_data: str
    volunteer_name: Optional[str] = None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- 5. WEBSOCKET ---
@app.websocket("/ws/updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# --- 6. ENDPOINTS ---

@app.get("/reports")
def get_reports(db: Session = Depends(get_db), lang: str = "english"):
    reports = db.query(ReportModel).all()
    lang_map = TRANSLATIONS.get(lang.lower())
    result = []
    for r in reports:
        result.append({
            "id": r.id,
            "lat": r.lat,
            "lng": r.lng,
            "severity": r.severity,
            "severity_label": lang_map.get(r.severity.lower(), r.severity) if lang_map else r.severity,
            "status": r.status,
            "status_label": lang_map.get(r.status.lower(), r.status) if lang_map else r.status,
            "desc": r.desc,
            "landmark": r.landmark,
            "before_image": r.image_data,
            "after_image": r.after_image_data,
            "reporter_name": r.reporter_name,
            "volunteer_name": r.volunteer_name,
            "cleaner_name": r.cleaner.name if r.cleaner else r.volunteer_name,
            "cleaner_score": r.cleaner.total_score if r.cleaner else None,
        })
    return result


@app.post("/reports")
async def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    new_report = ReportModel(
        lat=report.lat,
        lng=report.lng,
        severity=report.severity.lower(),
        status="reported",
        desc=report.desc,
        landmark=report.landmark,
        image_data=report.image_data,
        reporter_name=report.reporter_name,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    await manager.broadcast("update_reports")
    return new_report


@app.patch("/reports/{report_id}/claim")
async def claim_report(report_id: int, claim: ReportClaim, db: Session = Depends(get_db)):
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "in-progress"
    report.volunteer_name = claim.volunteer_name

    # Link to User record if it exists
    user = db.query(User).filter(User.name == claim.volunteer_name).first()
    if user:
        report.claimed_by_id = user.id

    db.commit()
    await manager.broadcast("update_reports")
    return report


@app.patch("/reports/{report_id}/clean")
async def clean_report(report_id: int, clean: ReportClean, db: Session = Depends(get_db)):
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.after_image_data = clean.after_image_data
    report.status = "cleaned"

    if clean.volunteer_name:
        report.volunteer_name = clean.volunteer_name

    # Award points to linked User OR find user by volunteer_name
    points = POINT_MAP.get(report.severity.lower(), 10)
    user = None
    if report.claimed_by_id:
        user = db.query(User).filter(User.id == report.claimed_by_id).first()
    if not user and report.volunteer_name:
        user = db.query(User).filter(User.name == report.volunteer_name).first()
        if not user:
            # Auto-create the user so they appear on the leaderboard
            user = User(name=report.volunteer_name, total_score=0, cleanup_count=0)
            db.add(user)
            db.flush()

    if user:
        user.total_score += points
        user.cleanup_count += 1

    db.commit()
    await manager.broadcast("update_leaderboard")
    await manager.broadcast("update_reports")
    return {"status": "cleaned", "points_awarded": points}


@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Returns all users ranked by total_score descending."""
    users = db.query(User).order_by(User.total_score.desc()).all()
    return [
        {"name": u.name, "cleanups": u.cleanup_count, "score": u.total_score}
        for u in users
    ]


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total": db.query(ReportModel).count(),
        "in_progress": db.query(ReportModel).filter(ReportModel.status == "in-progress").count(),
        "cleaned": db.query(ReportModel).filter(ReportModel.status == "cleaned").count(),
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)