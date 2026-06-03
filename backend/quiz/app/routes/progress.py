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