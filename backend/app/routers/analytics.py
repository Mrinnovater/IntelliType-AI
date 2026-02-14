from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database
from . import auth  # <--- FIXED

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/stats")
def get_user_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    stats = db.query(
        func.count(models.TypingTest.id).label("total"),
        func.avg(models.TypingTest.wpm).label("avg_wpm"),
        func.max(models.TypingTest.wpm).label("best_wpm"),
        func.avg(models.TypingTest.accuracy).label("avg_acc")
    ).filter(models.TypingTest.user_id == current_user.id).first()

    if not stats.total:
        return {
            "average_wpm": 0,
            "best_wpm": 0,
            "total_tests": 0,
            "accuracy_avg": 0
        }

    return {
        "average_wpm": round(stats.avg_wpm, 1),
        "best_wpm": round(stats.best_wpm, 1),
        "total_tests": stats.total,
        "accuracy_avg": round(stats.avg_acc, 1)
    }

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(database.get_db)):
    raw_results = db.query(models.TypingTest, models.User.username)\
        .join(models.User, models.TypingTest.user_id == models.User.id)\
        .order_by(models.TypingTest.wpm.desc())\
        .limit(50)\
        .all()
    
    final_leaderboard = []
    user_counts = {} 

    for test, username in raw_results:
        current_count = user_counts.get(username, 0)
        if current_count < 2:
            final_leaderboard.append({
                "username": username,
                "wpm": test.wpm,
                "accuracy": test.accuracy,
                "date": test.created_at
            })
            user_counts[username] = current_count + 1
        if len(final_leaderboard) == 5:
            break
        
    return final_leaderboard