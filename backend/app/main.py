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

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

SQLALCHEMY_DATABASE_URL = "sqlite:///./innerlog.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------
# MODEL
# -------------------
class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    ai_reflection = Column(Text, nullable=True)
    is_private = Column(Integer, default=0)

Base.metadata.create_all(bind=engine)

# -------------------
# SCHEMAS
# -------------------
class PostCreate(BaseModel):
    title: str
    content: str
    is_private: Optional[bool] = False

class PostResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]
    ai_reflection: Optional[str] = None
    is_private: bool

    class Config:
        from_attributes = True

# -------------------
# APP
# -------------------
app = FastAPI(title="InnerLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# AI
# -------------------
def generate_ai_reflection(post_id: int, title: str, content: str):
    db = SessionLocal()
    try:
        payload = {
            "contents": [{
                "parts": [{
                    "text": f"Ti si AI psiholog. Analiziraj:\n\nTitle: {title}\nContent: {content}\n40 words reflection, english."
                }]
            }]
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(URL, headers=headers, data=json.dumps(payload))
        result = response.json()

        ai_reflection = "AI could not respond 😢"
        if "candidates" in result:
            ai_reflection = result["candidates"][0]["content"]["parts"][0]["text"]

        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.ai_reflection = ai_reflection
            db.commit()

    except Exception as e:
        print("AI error:", e)
    finally:
        db.close()

# -------------------
# ROUTES
# -------------------
@app.get("/")
def root():
    return {"message": "🚀 InnerLog Backend running"}

@app.get("/posts", response_model=List[PostResponse])
def get_posts():
    db = SessionLocal()
    try:
        posts = db.query(Post).order_by(Post.id.desc()).all()

        result = []
        for post in posts:
            if post.is_private:
                result.append({
                    "id": post.id,
                    "title": post.title,
                    "content": None,
                    "ai_reflection": None,
                    "is_private": True
                })
            else:
                result.append({
                    "id": post.id,
                    "title": post.title,
                    "content": post.content,
                    "ai_reflection": post.ai_reflection,
                    "is_private": False
                })

        return result
    finally:
        db.close()

@app.post("/posts", response_model=PostResponse)
def create_post(post_data: PostCreate):
    db = SessionLocal()
    try:
        placeholder = "AI reflection is loading..."

        new_post = Post(
            title=post_data.title,
            content=post_data.content,
            ai_reflection=placeholder,
            is_private=1 if post_data.is_private else 0
        )

        db.add(new_post)
        db.commit()
        db.refresh(new_post)

        Thread(target=generate_ai_reflection, args=(new_post.id, post_data.title, post_data.content)).start()

        return new_post
    finally:
        db.close()