import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# FIX: Render/Railway/Supabase often provide 'postgres://', but SQLAlchemy needs 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to local SQLite
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./typing_app.db"

# CONFIGURATION
engine_args = {}
if "sqlite" in DATABASE_URL:
    engine_args = {"check_same_thread": False}
else:
    # CRITICAL FIX for Supabase Port 6543 (Transaction Pooler)
    # We must disable "prepared statements" because the pooler doesn't support them well.
    engine_args = {
        "pool_pre_ping": True, 
        "pool_recycle": 300,
        "connect_args": {
            "prepare_threshold": None  # Disables prepared statements for psycopg2
        }
    }

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()