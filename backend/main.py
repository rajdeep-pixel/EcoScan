import hashlib
import hmac
import secrets
import uvicorn
from fastapi import Depends, FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from contextlib import asynccontextmanager

from ai_review import review_cleanup_images
from database import ReportModel, SessionLocal, User, ensure_schema

ROLE_CITIZEN = "citizen"
ROLE_VOLUNTEER = "volunteer"
VALID_ROLES = {ROLE_CITIZEN, ROLE_VOLUNTEER}
VALID_REPORT_STATUSES = {
    "reported",
    "in-progress",
    "cleaned",
    "pending-review",
    "verification-failed",
}


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
    ensure_schema()
    db = SessionLocal()
    try:
        if False and db.query(User).count() == 0:
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
class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    role: str


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class ReportCreate(BaseModel):
    lat: float
    lng: float
    severity: str
    desc: Optional[str] = None
    landmark: Optional[str] = None
    image_data: str = Field(min_length=10)


class ReportClean(BaseModel):
    after_image_data: str = Field(min_length=10)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_role(role: str) -> str:
    normalized = role.strip().lower()
    if normalized not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Role must be citizen or volunteer")
    return normalized


def normalize_severity(severity: str) -> str:
    normalized = severity.strip().lower()
    if normalized not in POINT_MAP:
        raise HTTPException(status_code=400, detail="Severity must be low, medium, or high")
    return normalized


def hash_password(password: str, salt: Optional[str] = None) -> str:
    safe_salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), safe_salt.encode("utf-8"), 100000)
    return f"{safe_salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash or "$" not in stored_hash:
        return False
    salt, expected = stored_hash.split("$", 1)
    candidate = hash_password(password, salt).split("$", 1)[1]
    return hmac.compare_digest(candidate, expected)


def issue_auth_token(user: User) -> str:
    user.auth_token = secrets.token_urlsafe(32)
    return user.auth_token


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "score": user.total_score,
        "cleanups": user.cleanup_count,
    }


def serialize_report(report: ReportModel) -> dict:
    return {
        "id": report.id,
        "lat": report.lat,
        "lng": report.lng,
        "severity": report.severity,
        "status": report.status,
        "desc": report.desc,
        "landmark": report.landmark,
        "before_image": report.image_data,
        "after_image": report.after_image_data,
        "reporter_name": report.reporter.name if report.reporter else report.reporter_name,
        "reporter_role": report.reporter.role if report.reporter else None,
        "volunteer_name": report.cleaner.name if report.cleaner else report.volunteer_name,
        "verification_status": report.verification_status,
        "verification_confidence": report.verification_confidence,
        "verification_summary": report.verification_summary,
    }


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    token = authorization.split(" ", 1)[1].strip()
    user = db.query(User).filter(User.auth_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return user


def require_volunteer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != ROLE_VOLUNTEER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Volunteer account required")
    return current_user


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

@app.post("/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="Email is already registered")

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=normalize_role(payload.role),
    )
    token = issue_auth_token(user)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": token, "user": serialize_user(user)}


@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = issue_auth_token(user)
    db.commit()
    db.refresh(user)
    return {"token": token, "user": serialize_user(user)}


@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"user": serialize_user(current_user)}

@app.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(ReportModel).order_by(ReportModel.id.desc()).all()
    return [serialize_report(report) for report in reports]


@app.post("/reports")
async def create_report(
    report: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_report = ReportModel(
        lat=report.lat,
        lng=report.lng,
        severity=normalize_severity(report.severity),
        status="reported",
        desc=report.desc.strip() if report.desc else None,
        landmark=report.landmark.strip() if report.landmark else None,
        image_data=report.image_data,
        reporter_name=current_user.name,
        reporter_id=current_user.id,
        verification_status="not-started",
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return serialize_report(new_report)


@app.patch("/reports/{report_id}/claim")
def claim_report(
    report_id: int,
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db),
):
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.status not in {"reported", "verification-failed"}:
        raise HTTPException(status_code=400, detail="This report cannot be claimed right now")

    report.status = "in-progress"
    report.volunteer_name = current_user.name
    report.claimed_by_id = current_user.id
    db.commit()
    db.refresh(report)
    return serialize_report(report)


@app.patch("/reports/{report_id}/clean")
async def clean_report(
    report_id: int,
    clean: ReportClean,
    current_user: User = Depends(require_volunteer),
    db: Session = Depends(get_db),
):
    report = db.query(ReportModel).filter(ReportModel.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.claimed_by_id and report.claimed_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the volunteer who claimed this report can submit proof")
    if not report.image_data:
        raise HTTPException(status_code=400, detail="This report is missing a before image")

    report.after_image_data = clean.after_image_data
    report.volunteer_name = current_user.name
    report.claimed_by_id = current_user.id

    verification = review_cleanup_images(
        before_image=report.image_data,
        after_image=clean.after_image_data,
        description=report.desc or "",
        landmark=report.landmark or "",
    )

    report.verification_status = verification["status"]
    report.verification_confidence = verification["confidence"]
    report.verification_summary = verification["summary"]

    points = 0
    if verification["status"] == "approved":
        report.status = "cleaned"
        points = POINT_MAP.get(report.severity.lower(), 10)
        current_user.total_score += points
        current_user.cleanup_count += 1
    elif verification["status"] == "unavailable":
        report.status = "pending-review"
    else:
        report.status = "verification-failed"

    db.commit()
    db.refresh(report)
    db.refresh(current_user)
    return {
        "report": serialize_report(report),
        "points_awarded": points,
        "verification": verification,
    }


@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .filter(User.role == ROLE_VOLUNTEER)
        .order_by(User.total_score.desc(), User.cleanup_count.desc(), User.name.asc())
        .all()
    )
    return [
        {"name": u.name, "role": u.role, "cleanups": u.cleanup_count, "score": u.total_score}
        for u in users
    ]


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    reports = db.query(ReportModel).all()
    counts = {report_status: 0 for report_status in VALID_REPORT_STATUSES}
    for report in reports:
        if report.status in counts:
            counts[report.status] += 1

    return {
        "total": len(reports),
        "reported": counts["reported"],
        "in_progress": counts["in-progress"],
        "cleaned": counts["cleaned"],
        "pending_review": counts["pending-review"],
        "verification_failed": counts["verification-failed"],
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
