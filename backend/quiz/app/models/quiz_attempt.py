from pydantic import BaseModel

class QuizAttempt(BaseModel):
    user_id: str
    organ: str
    difficulty: str
    score: int
    total_questions: int
    percentage: float
    weak_areas: list[str]