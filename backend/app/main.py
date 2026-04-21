from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from threading import Thread
from datetime import datetime
import os, requests, json, hashlib, secrets
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@innerlog.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "innerlog123")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# fallback samo za lokalni development
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./innerlog.db"

# fix za stare postgres URL-ove (Heroku stil)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

# engine config
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"sslmode": "require"} 
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

active_tokens = {}

# -------------------
# MODELS
# -------------------
class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    ai_reflection = Column(Text, nullable=True)
    is_private = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    mood_score = Column(Float, nullable=True)
    mood_label = Column(String, nullable=True)

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer)
    nickname = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    ai_verdict = Column(Text, nullable=True)
    ai_verdict_score = Column(Float, nullable=True)

class Reaction(Base):
    __tablename__ = "reactions"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer)
    ip_hash = Column(String)
    reaction = Column(String)

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
    created_at: Optional[datetime] = None
    likes: int = 0
    dislikes: int = 0
    comment_count: int = 0
    mood_score: Optional[float] = None
    mood_label: Optional[str] = None

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    nickname: str
    content: str

class CommentResponse(BaseModel):
    id: int
    post_id: int
    nickname: str
    content: str
    created_at: datetime
    ai_verdict: Optional[str] = None
    ai_verdict_score: Optional[float] = None

    class Config:
        from_attributes = True

class ReactionCreate(BaseModel):
    reaction: str

class TokenResponse(BaseModel):
    token: str
    is_admin: bool

# -------------------
# AUTH
# -------------------
def get_ip_hash(request: Request) -> str:
    ip = request.client.host
    return hashlib.sha256(ip.encode()).hexdigest()

def get_current_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth.split(" ")[1]
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return True

# -------------------
# APP
# -------------------
app = FastAPI(title="InnerLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://innerlog-one.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------
# AI HELPERS
# -------------------
def call_gemini(prompt: str) -> str:
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(URL, headers=headers, data=json.dumps(payload))
    result = response.json()
    if "candidates" in result:
        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
    return ""

def generate_ai_analysis(post_id: int, title: str, content: str):
    db = SessionLocal()
    try:
        # 1. Reflection
        reflection_prompt = f"""You are a philosophical psychologist and writer. Read this personal blog post and provide a thoughtful, empathetic reflection in 60-80 words. Be insightful, not generic. Speak directly to the author. Focus on the deeper emotional and philosophical layers of what they expressed.

Title: {title}
Content: {content}

Write only the reflection, no preamble."""

        reflection = call_gemini(reflection_prompt) or "AI could not respond 😢"

        # 2. Mood analysis
        mood_prompt = f"""Analyze the emotional tone of this blog post. Return ONLY a JSON object with two fields:
- "score": a number from 1 to 10 (1=very negative/distressed, 5=neutral, 10=very positive/joyful)
- "label": one of these exact words: "distressed", "sad", "anxious", "melancholic", "neutral", "reflective", "calm", "hopeful", "happy", "joyful"

Title: {title}
Content: {content}

Return only valid JSON, nothing else. Example: {{"score": 4, "label": "melancholic"}}"""

        mood_raw = call_gemini(mood_prompt)
        mood_score = 5.0
        mood_label = "neutral"
        try:
            clean = mood_raw.replace("```json", "").replace("```", "").strip()
            mood_data = json.loads(clean)
            mood_score = float(mood_data.get("score", 5))
            mood_label = mood_data.get("label", "neutral")
        except:
            pass

        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.ai_reflection = reflection
            post.mood_score = mood_score
            post.mood_label = mood_label
            db.commit()

    except Exception as e:
        print("AI error:", e)
    finally:
        db.close()

def generate_comment_verdict(comment_id: int, post_title: str, post_content: str, comment_content: str):
    db = SessionLocal()
    try:
        prompt = f"""You are a critical thinking analyst. A reader left a comment on a blog post. Evaluate whether the comment is thoughtful, relevant, and valid in relation to the post's content.

POST TITLE: {post_title}
POST CONTENT: {post_content[:800]}

COMMENT: {comment_content}

Return ONLY a JSON object with:
- "verdict": one of "insightful", "valid", "neutral", "off-topic", "superficial"
- "score": number 1-10 (how relevant and thoughtful the comment is)
- "reasoning": one sentence explaining your verdict (max 20 words)

Example: {{"verdict": "insightful", "score": 8, "reasoning": "Directly addresses the core tension in the post with genuine reflection."}}

Return only valid JSON."""

        raw = call_gemini(prompt)
        verdict = "neutral"
        score = 5.0
        reasoning = ""
        try:
            clean = raw.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean)
            verdict = data.get("verdict", "neutral")
            score = float(data.get("score", 5))
            reasoning = data.get("reasoning", "")
        except:
            pass

        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if comment:
            comment.ai_verdict = f"{verdict}|{reasoning}"
            comment.ai_verdict_score = score
            db.commit()

    except Exception as e:
        print("Comment AI error:", e)
    finally:
        db.close()

# -------------------
# HELPERS
# -------------------
def get_post_with_stats(post, db):
    likes = db.query(Reaction).filter(Reaction.post_id == post.id, Reaction.reaction == "like").count()
    dislikes = db.query(Reaction).filter(Reaction.post_id == post.id, Reaction.reaction == "dislike").count()
    comment_count = db.query(Comment).filter(Comment.post_id == post.id).count()

    if post.is_private:
        return {
            "id": post.id, "title": post.title, "content": None,
            "ai_reflection": None, "is_private": True,
            "created_at": post.created_at, "likes": likes,
            "dislikes": dislikes, "comment_count": comment_count,
            "mood_score": None, "mood_label": None,
        }
    return {
        "id": post.id, "title": post.title, "content": post.content,
        "ai_reflection": post.ai_reflection, "is_private": False,
        "created_at": post.created_at, "likes": likes,
        "dislikes": dislikes, "comment_count": comment_count,
        "mood_score": post.mood_score, "mood_label": post.mood_label,
    }

# -------------------
# ROUTES — AUTH
# -------------------
@app.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != ADMIN_EMAIL or form_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = secrets.token_hex(32)
    active_tokens[token] = {"email": form_data.username, "created_at": datetime.utcnow()}
    return {"token": token, "is_admin": True}

@app.post("/auth/logout")
def logout(request: Request):
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.split(" ")[1]
        active_tokens.pop(token, None)
    return {"message": "Logged out"}

@app.get("/auth/me")
def me(admin=Depends(get_current_admin)):
    return {"is_admin": True}

# -------------------
# ROUTES — POSTS
# -------------------
@app.get("/")
def root():
    return {"message": "🚀 InnerLog Backend running"}

@app.get("/posts", response_model=List[PostResponse])
def get_posts():
    db = SessionLocal()
    try:
        posts = db.query(Post).order_by(Post.id.desc()).all()
        return [get_post_with_stats(p, db) for p in posts]
    finally:
        db.close()

@app.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: int):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return get_post_with_stats(post, db)
    finally:
        db.close()

@app.post("/posts", response_model=PostResponse)
def create_post(post_data: PostCreate, admin=Depends(get_current_admin)):
    db = SessionLocal()
    try:
        new_post = Post(
            title=post_data.title,
            content=post_data.content,
            ai_reflection="AI is reflecting...",
            is_private=1 if post_data.is_private else 0
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        Thread(target=generate_ai_analysis, args=(new_post.id, post_data.title, post_data.content)).start()
        return get_post_with_stats(new_post, db)
    finally:
        db.close()

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, admin=Depends(get_current_admin)):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        db.delete(post)
        db.commit()
        return {"message": "Deleted"}
    finally:
        db.close()

# -------------------
# ROUTES — COMMENTS
# -------------------
@app.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int):
    db = SessionLocal()
    try:
        return db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    finally:
        db.close()

@app.post("/posts/{post_id}/comments", response_model=CommentResponse)
def create_comment(post_id: int, comment_data: CommentCreate):
    db = SessionLocal()
    try:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post or post.is_private:
            raise HTTPException(status_code=404, detail="Post not found or private")
        if not comment_data.nickname.strip() or not comment_data.content.strip():
            raise HTTPException(status_code=400, detail="Nickname and content required")
        comment = Comment(
            post_id=post_id,
            nickname=comment_data.nickname.strip()[:30],
            content=comment_data.content.strip()[:500],
            ai_verdict="analyzing...",
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        Thread(target=generate_comment_verdict, args=(
            comment.id, post.title, post.content, comment_data.content
        )).start()
        return comment
    finally:
        db.close()

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, admin=Depends(get_current_admin)):
    db = SessionLocal()
    try:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Not found")
        db.delete(comment)
        db.commit()
        return {"message": "Deleted"}
    finally:
        db.close()

# -------------------
# ROUTES — REACTIONS
# -------------------
@app.post("/posts/{post_id}/react")
def react(post_id: int, reaction_data: ReactionCreate, request: Request):
    if reaction_data.reaction not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Invalid reaction")
    db = SessionLocal()
    try:
        ip_hash = get_ip_hash(request)
        existing = db.query(Reaction).filter(
            Reaction.post_id == post_id,
            Reaction.ip_hash == ip_hash
        ).first()
        if existing:
            if existing.reaction == reaction_data.reaction:
                db.delete(existing)
                db.commit()
                return {"action": "removed"}
            else:
                existing.reaction = reaction_data.reaction
                db.commit()
                return {"action": "switched"}
        else:
            db.add(Reaction(post_id=post_id, ip_hash=ip_hash, reaction=reaction_data.reaction))
            db.commit()
            return {"action": "added"}
    finally:
        db.close()

@app.get("/posts/{post_id}/my-reaction")
def my_reaction(post_id: int, request: Request):
    db = SessionLocal()
    try:
        ip_hash = get_ip_hash(request)
        existing = db.query(Reaction).filter(
            Reaction.post_id == post_id,
            Reaction.ip_hash == ip_hash
        ).first()
        return {"reaction": existing.reaction if existing else None}
    finally:
        db.close()

# -------------------
# ROUTES — MOOD
# -------------------
@app.get("/mood/history")
def mood_history(admin=Depends(get_current_admin)):
    db = SessionLocal()
    try:
        posts = db.query(Post).filter(
            Post.is_private == 0,
            Post.mood_score != None
        ).order_by(Post.created_at.asc()).all()
        return [
            {
                "id": p.id,
                "title": p.title,
                "mood_score": p.mood_score,
                "mood_label": p.mood_label,
                "created_at": p.created_at,
            }
            for p in posts
        ]
    finally:
        db.close()