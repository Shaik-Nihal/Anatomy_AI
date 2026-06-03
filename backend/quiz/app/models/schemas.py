from pydantic import BaseModel
from typing import List

class TutorRequest(BaseModel):
    question: str

class TutorResponse(BaseModel):
    answer: str

class ProgressResponse(BaseModel):
    sessions: int
    clarity: int
    topics: List[str]

class VoiceRequest(BaseModel):
    language: str | None = 'en'
