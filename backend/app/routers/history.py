from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database
from . import auth  # <--- FIXED: Import from current folder (routers), not parent

router = APIRouter(
    prefix="/history",
    tags=["history"]
)

@router.get("/")
def get_user_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Uses 'TypingTest' to match your models.py
    tests = db.query(models.TypingTest).filter(models.TypingTest.user_id == current_user.id).order_by(models.TypingTest.created_at.desc()).all()
    return tests