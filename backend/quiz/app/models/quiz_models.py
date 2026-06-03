from pydantic import BaseModel

class QuizRequest(BaseModel):
    organ: str
    difficulty: str