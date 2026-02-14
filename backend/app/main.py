from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, history, analytics, typing  # Ensure these match your actual imports
import os
from dotenv import load_dotenv

load_dotenv()

# Create tables in the new database (Supabase) automatically
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Get the frontend URL from .env (defaults to localhost if not set)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

origins = [
    "http://localhost:5173",        # Local React
    "http://127.0.0.1:5173",        # Local React (alternate)
    FRONTEND_URL,                   # Deployed React URL (we will set this later on Render)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(history.router)
app.include_router(analytics.router)
app.include_router(typing.router) # If you have a typing router

@app.get("/")
def read_root():
    return {"message": "IntelliType AI API is Running"}