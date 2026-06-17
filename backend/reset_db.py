import os
from database import Base, engine, ensure_schema

def reset():
    db_url = os.getenv("DATABASE_URL", "sqlite:///./ecoscan.db")
    print(f"Target Database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    print("WARNING: This will delete all users and reports data in the database!")
    confirm = input("Type 'YES' to confirm: ")
    if confirm != 'YES':
        print("Cancelled.")
        return
        
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating database schema...")
    ensure_schema()
    print("Database reset completed successfully!")

if __name__ == "__main__":
    reset()
