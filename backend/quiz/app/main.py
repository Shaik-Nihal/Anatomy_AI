from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.quiz import router as quiz_router
from app.routes.progress import router as progress_router
from app.database import get_connection

# Initialize database tables on startup
try:
    conn = get_connection()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        organ TEXT,
        difficulty TEXT,
        score INTEGER,
        total_questions INTEGER,
        percentage REAL,
        weak_areas TEXT,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Error initializing database on startup: {e}")

app = FastAPI(
    title="AR Organ Viewer Quiz API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    quiz_router,
    prefix="/api"
)
app.include_router(
    progress_router,
    prefix="/progress",
    tags=["Progress"]
)

@app.get("/")
def home():
    return {
        "message": "Quiz API Running Successfully"
    }