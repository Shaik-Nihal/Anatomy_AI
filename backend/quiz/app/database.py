import os
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(dotenv_path=env_path, override=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Store database files in a separate folder in the backend folder
BACKEND_DIR = os.path.dirname(os.path.dirname(BASE_DIR))
DB_DIR = os.path.join(BACKEND_DIR, "db")
DB_NAME = os.path.join(DB_DIR, "quiz.db")

# Ensure database directory exists
os.makedirs(DB_DIR, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL)
    return sqlite3.connect(DB_NAME)

def execute_query(query: str, params: tuple = ()):
    conn = get_connection()
    is_pg = hasattr(conn, "cursor") and not isinstance(conn, sqlite3.Connection)
    
    try:
        if not is_pg:
            # SQLite flow
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            if query.strip().upper().startswith("SELECT"):
                rows = cursor.fetchall()
                result = [dict(row) for row in rows]
            else:
                conn.commit()
                result = None
            return result
        else:
            # PostgreSQL (Supabase) flow - translate ? placeholders to %s
            pg_query = query.replace("?", "%s")
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(pg_query, params)
            if query.strip().upper().startswith("SELECT"):
                rows = cursor.fetchall()
                result = [dict(row) for row in rows]
            else:
                conn.commit()
                result = None
            return result
    finally:
        conn.close()