import os
from dotenv import load_dotenv
from sqlalchemy import Column, Integer, Float, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load variables from the .env file
load_dotenv()

# Fetch the URL from the environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    # Fallback to local SQLite if DATABASE_URL is missing
    SQLALCHEMY_DATABASE_URL = "sqlite:///./ecoscan.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Initialize the engine and session for the provided URL
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ReportModel(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    
    # CONSTRAINT 1: Location must be real [cite: 33, 34]
    lat = Column(Float, nullable=False) # [cite: 33, 34]
    lng = Column(Float, nullable=False) # [cite: 33, 34]
    
    # Severity must be Low, Medium, or High [cite: 18, 19]
    severity = Column(String, nullable=False) # lowercase: "low", "medium", "high" [cite: 18, 19]
    
    # Status: reported, in-progress, cleaned
    status = Column(String, default="reported") 
    
    desc = Column(String, nullable=True) 
    
    # Requirement: User adds a photo [cite: 18]
    image_data = Column(String, nullable=True) # [cite: 18]
    
    # NEW fields for Verification & Leaderboard
    reporter_name    = Column(String, nullable=True) # Who found the waste
    volunteer_name   = Column(String, nullable=True)
    after_image_data = Column(String, nullable=True) # The "After" photo proof

# Create tables immediately on import
Base.metadata.create_all(bind=engine)

