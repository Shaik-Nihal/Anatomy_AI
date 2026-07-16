from fastapi import APIRouter
from app.models.quiz_models import QuizRequest
from app.services.gemini_service import generate_quiz

router = APIRouter()

@router.post("/generate-quiz")
def generate(data: QuizRequest):

    questions = generate_quiz(
        data.organ,
        data.difficulty
    )

    return questions