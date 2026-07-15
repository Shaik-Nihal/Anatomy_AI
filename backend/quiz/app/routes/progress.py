from fastapi import APIRouter
from app.database import execute_query
from app.models.quiz_attempt import QuizAttempt

router = APIRouter()

@router.post("/save-result")
def save_result(data: QuizAttempt):
    execute_query(
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

    return {
        "success": True
    }   


@router.get("/all-results")
def all_results():
    return execute_query("SELECT * FROM quiz_attempts")


@router.get("/user/{user_id}")
def get_user_results(user_id: str):
    return execute_query(
        "SELECT * FROM quiz_attempts WHERE user_id=?",
        (user_id,)
    )


@router.get("/tutor/{user_id}")
def get_tutor_progress(user_id: str):
    data = execute_query(
        "SELECT * FROM quiz_attempts WHERE user_id=?",
        (user_id,)
    )
    
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
    execute_query(
        "DELETE FROM quiz_attempts WHERE user_id=?",
        (user_id,)
    )
    return {
        "success": True,
        "message": "User quiz progress deleted successfully."
    }