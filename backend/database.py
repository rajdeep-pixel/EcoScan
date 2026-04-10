from sqlalchemy import create_all, Column, Integer, Float, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# If using a local Postgres, the URL looks like this:
SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ReportModel(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, nullable=False) 
    lng = Column(Float, nullable=False) 
    severity = Column(String, nullable=False) # Low, Medium, High
    status = Column(String, default="Reported") # Reported, In Progress, Cleaned 
    image_data = Column(String, nullable=True) # Store Base64 string for speed

Base.metadata.create_all(bind=engine)