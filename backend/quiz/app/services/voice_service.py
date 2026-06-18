import os
import openai
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Voice transcription usually uses Whisper which is an OpenAI-only endpoint, 
# so we configure it to use OpenAI API Key specifically.
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

def transcribe_audio(file_path: Path, language: str = 'en') -> str:
    if not OPENAI_API_KEY:
        return 'OpenAI key is missing for voice transcription. Please set OPENAI_API_KEY in .env'

    client = openai.OpenAI(
        api_key=OPENAI_API_KEY,
        base_url="https://api.openai.com/v1"
    )
    try:
        with open(file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(
                model='whisper-1',
                file=audio_file,
                prompt=f'Transcribe the audio in {language}',
            )
        return transcript.text.strip()
    except Exception as error:
        return f'Error transcribing audio: {error}'
