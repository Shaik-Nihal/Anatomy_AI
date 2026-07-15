from fastapi import APIRouter, HTTPException
from app.models.schemas import TutorRequest, TutorResponse
from app.services.openai_service import generate_answer

router = APIRouter(prefix='/tutor', tags=['tutor'])

@router.post('', response_model=TutorResponse)
async def ask_tutor(request: TutorRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail='Question cannot be empty.')

    answer = generate_answer(request.question, conversational_mode=request.conversational_mode)
    return {'answer': answer}
