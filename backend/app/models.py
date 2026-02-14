from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)  # Changed from password_hash to match generic Auth logic
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    tests = relationship("TypingTest", back_populates="user")

class TypingTest(Base):
    __tablename__ = "typing_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    wpm = Column(Float)
    accuracy = Column(Float)
    error_rate = Column(Float)
    duration = Column(Integer)  # in seconds
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="tests")