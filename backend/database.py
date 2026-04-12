import os
from dotenv import load_dotenv
from sqlalchemy import Column, Integer, Float, String, ForeignKey, create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

load_dotenv()

# Database Setup
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ecoscan.db")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    role = Column(String, default="citizen", nullable=False)
    auth_token = Column(String, nullable=True)
    total_score = Column(Integer, default=0)
    cleanup_count = Column(Integer, default=0)
    claimed_reports = relationship(
        "ReportModel", back_populates="cleaner",
        foreign_keys="ReportModel.claimed_by_id"
    )
    submitted_reports = relationship(
        "ReportModel", back_populates="reporter",
        foreign_keys="ReportModel.reporter_id"
    )


class ReportModel(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, default="reported")  # reported | in-progress | pending-proof | cleaned
    desc = Column(String, nullable=True)
    landmark = Column(String, nullable=True)

    # Images
    image_data = Column(String, nullable=True)       # before photo (base64)
    after_image_data = Column(String, nullable=True)  # after photo (base64)

    # Who reported / who cleaned (name-based, works without auth)
    reporter_name = Column(String, nullable=True)
    volunteer_name = Column(String, nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Optional FK to User table for score tracking
    claimed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_status = Column(String, default="not-started")
    verification_confidence = Column(Float, nullable=True)
    verification_summary = Column(String, nullable=True)
    cleaner = relationship(
        "User", back_populates="claimed_reports",
        foreign_keys=[claimed_by_id]
    )
    reporter = relationship(
        "User", back_populates="submitted_reports",
        foreign_keys=[reporter_id]
    )


def ensure_schema():
    Base.metadata.create_all(bind=engine)

    schema_updates = {
        "users": [
            ("email", "ALTER TABLE users ADD COLUMN email VARCHAR"),
            ("password_hash", "ALTER TABLE users ADD COLUMN password_hash VARCHAR"),
            ("role", "ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'citizen'"),
            ("auth_token", "ALTER TABLE users ADD COLUMN auth_token VARCHAR"),
            ("total_score", "ALTER TABLE users ADD COLUMN total_score INTEGER DEFAULT 0"),
            ("cleanup_count", "ALTER TABLE users ADD COLUMN cleanup_count INTEGER DEFAULT 0"),
        ],
        "reports": [
            ("status", "ALTER TABLE reports ADD COLUMN status VARCHAR DEFAULT 'reported'"),
            ("desc", 'ALTER TABLE reports ADD COLUMN "desc" VARCHAR'),
            ("landmark", "ALTER TABLE reports ADD COLUMN landmark VARCHAR"),
            ("image_data", "ALTER TABLE reports ADD COLUMN image_data VARCHAR"),
            ("after_image_data", "ALTER TABLE reports ADD COLUMN after_image_data VARCHAR"),
            ("reporter_name", "ALTER TABLE reports ADD COLUMN reporter_name VARCHAR"),
            ("volunteer_name", "ALTER TABLE reports ADD COLUMN volunteer_name VARCHAR"),
            ("reporter_id", "ALTER TABLE reports ADD COLUMN reporter_id INTEGER"),
            ("claimed_by_id", "ALTER TABLE reports ADD COLUMN claimed_by_id INTEGER"),
            ("verification_status", "ALTER TABLE reports ADD COLUMN verification_status VARCHAR DEFAULT 'not-started'"),
            ("verification_confidence", "ALTER TABLE reports ADD COLUMN verification_confidence DOUBLE PRECISION"),
            ("verification_summary", "ALTER TABLE reports ADD COLUMN verification_summary VARCHAR"),
        ],
    }

    inspector = inspect(engine)

    with engine.begin() as connection:
        for table_name, updates in schema_updates.items():
            existing_tables = inspector.get_table_names()
            if table_name not in existing_tables:
                continue

            existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
            for column_name, statement in updates:
                if column_name not in existing_columns:
                    connection.execute(text(statement))

        if "reports" in inspector.get_table_names():
            fk_names = {fk["name"] for fk in inspector.get_foreign_keys("reports") if fk.get("name")}
            if "reports_reporter_id_fkey" not in fk_names:
                try:
                    connection.execute(
                        text(
                            "ALTER TABLE reports "
                            "ADD CONSTRAINT reports_reporter_id_fkey "
                            "FOREIGN KEY (reporter_id) REFERENCES users(id)"
                        )
                    )
                except Exception:
                    pass
            if "reports_claimed_by_id_fkey" not in fk_names:
                try:
                    connection.execute(
                        text(
                            "ALTER TABLE reports "
                            "ADD CONSTRAINT reports_claimed_by_id_fkey "
                            "FOREIGN KEY (claimed_by_id) REFERENCES users(id)"
                        )
                    )
                except Exception:
                    pass


ensure_schema()
