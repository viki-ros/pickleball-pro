import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Automatic persistent storage on Hugging Face Spaces (/data) or local SQLite
if os.path.exists("/data") and os.access("/data", os.W_OK):
    DEFAULT_DB = "sqlite:////data/pickleball.db"
else:
    DEFAULT_DB = "sqlite:///./pickleball.db"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
