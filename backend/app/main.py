from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from threading import Thread
import os, requests, json
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./innerlog.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database model
class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    ai_reflection = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

# Pydantic schemas
class PostCreate(BaseModel):
    title: str
    content: str

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    ai_reflection: Optional[str] = None
    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI(title="InnerLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------
# Helper function for AI generation
# --------------------------------
def generate_ai_reflection(post_id: int, title: str, content: str):
    db = SessionLocal()
    try:
        payload = {
            "contents": [{
                "parts": [{
                    "text": f"Ti si AI psiholog, filozof i znanstvenik. Analiziraj ove misli i pitanja:\n\nTitle: {title}\nContent: {content}\nDaj iskrenu refleksiju u 40 riječi, english."
                }]
            }]
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(URL, headers=headers, data=json.dumps(payload))
        result = response.json()
        ai_reflection = "AI could not respond 😢"
        if "candidates" in result:
            ai_reflection = result["candidates"][0]["content"]["parts"][0]["text"]

        # Update post in DB
        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.ai_reflection = ai_reflection
            db.commit()
    except Exception as e:
        print("AI error:", e)
    finally:
        db.close()

# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def root():
    return {"message": "🚀 InnerLog Backend is running!", "ai_model": "Gemini 2.5 Flash"}

@app.get("/posts", response_model=List[PostResponse])
def get_posts():
    db = SessionLocal()
    try:
        posts = db.query(Post).order_by(Post.id.desc()).all()
        return posts
    finally:
        db.close()

@app.post("/posts", response_model=PostResponse)
def create_post(post_data: PostCreate):
    db = SessionLocal()
    try:
        placeholder = "AI reflection is loading..."
        new_post = Post(title=post_data.title, content=post_data.content, ai_reflection=placeholder)
        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        # Start AI generation in background
        Thread(target=generate_ai_reflection, args=(new_post.id, post_data.title, post_data.content)).start()

        return new_post
    finally:
        db.close()

@app.get("/check-api")
def check_api():
    if not API_KEY:
        return {"status": "❌ API key not set in .env"}
    try:
        test_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
        response = requests.get(test_url)
        result = response.json()
        if response.status_code == 200:
            models = [model.get("name", "unknown") for model in result.get("models", [])]
            return {"status": "✅ API working!", "available_models": models[:5], "total_models": len(models)}
        else:
            return {"status": "❌ API not working", "error": result}
    except Exception as e:
        return {"status": "❌ Error", "error": str(e)}