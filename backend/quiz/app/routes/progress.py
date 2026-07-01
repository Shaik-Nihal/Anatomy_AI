from fastapi import APIRouter
from app.database import get_connection
from app.models.quiz_attempt import QuizAttempt

router = APIRouter()

@router.post("/save-result")
def save_result(data: QuizAttempt):

    conn = get_connection()

    conn.execute(
        """
        INSERT INTO quiz_attempts
        (
            user_id,
            organ,
            difficulty,
            score,
            total_questions,
            percentage,
            weak_areas
        )
        VALUES (?,?,?,?,?,?,?)
        """,
        (
            data.user_id,
            data.organ,
            data.difficulty,
            data.score,
            data.total_questions,
            data.percentage,
            ",".join(data.weak_areas)
        )
    )

    conn.commit()
    conn.close()

    return {
        "success": True
    }   


@router.get("/all-results")
def all_results():

    conn = get_connection()

    data = conn.execute(
        "SELECT * FROM quiz_attempts"
    ).fetchall()

    conn.close()

    return [dict(row) for row in data]

@router.get("/user/{user_id}")
def get_user_results(user_id: str):

    conn = get_connection()

    data = conn.execute(
        "SELECT * FROM quiz_attempts WHERE user_id=?",
        (user_id,)
    ).fetchall()

    conn.close()

    return [dict(row) for row in data]

@router.get("/tutor/{user_id}")
def get_tutor_progress(user_id: str):
    conn = get_connection()
    data = conn.execute(
        "SELECT * FROM quiz_attempts WHERE user_id=?",
        (user_id,)
    ).fetchall()
    conn.close()
    
    sessions = len(data)
    if sessions > 0:
        avg_score = int(sum(row["percentage"] for row in data) / sessions)
        topics = list(set(row["organ"] for row in data))
    else:
        avg_score = 0
        topics = []
        
    return {
        "sessions": sessions,
        "clarity": avg_score,
        "topics": topics
    }

@router.delete("/user/{user_id}")
def delete_user_progress(user_id: str):
    conn = get_connection()
    conn.execute(
        "DELETE FROM quiz_attempts WHERE user_id=?",
        (user_id,)
    )
    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": "User quiz progress deleted successfully."
    }