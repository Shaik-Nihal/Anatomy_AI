from app.database import get_connection

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

print("Database Ready")
