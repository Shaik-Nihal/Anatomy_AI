from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pathlib import Path
from app.services.voice_service import transcribe_audio

router = APIRouter(prefix='/voice', tags=['voice'])

@router.post('/transcribe')
async def transcribe_voice(language: str = Form('en'), audio: UploadFile = File(...)):
    content_type = audio.content_type or ''
    if content_type.split('/')[0] != 'audio':
        raise HTTPException(status_code=400, detail='Uploaded file must be audio.')

    temp_path = Path('tmp_audio')
    temp_path.mkdir(exist_ok=True)
    filename = audio.filename or 'uploaded_audio'
    target_file = temp_path / filename

    with open(target_file, 'wb') as buffer:
        buffer.write(await audio.read())

    transcript = transcribe_audio(target_file, language)
    return {'transcript': transcript}

@router.post('/speak')
async def speak_text(text: str = Form(...), voice: str = Form('alloy')):
    from app.services.voice_service import generate_speech
    from fastapi.responses import Response
    try:
        audio_content = generate_speech(text, voice)
        return Response(content=audio_content, media_type='audio/mpeg')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

