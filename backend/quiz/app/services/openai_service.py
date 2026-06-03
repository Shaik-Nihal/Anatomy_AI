import os
import openai
from dotenv import load_dotenv

load_dotenv()

# Use two keys: GEMINI_API_KEY for quiz generator, and GROQ_API_KEY for AITutor.
# Support fallback to OPENAI_API_KEY if specified by the user.
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
API_TIMEOUT = 30

SYSTEM_PROMPT = (
    'You are an educational AI tutor. Answer clearly and simply for a student asking about science and anatomy topics.'
)

def generate_answer(question: str) -> str:
    if not GROQ_API_KEY:
        return 'Groq/OpenAI API key is missing. Add GROQ_API_KEY to your backend/quiz/.env.'

    openai.api_key = GROQ_API_KEY
    
    # Configure Groq endpoint compatibility if GROQ_API_KEY starts with gsk_ or if specified
    is_groq = GROQ_API_KEY.startswith("gsk_")
    if is_groq:
        openai.api_base = "https://api.groq.com/openai/v1"
        model_name = "llama-3.3-70b-versatile"
    else:
        openai.api_base = "https://api.openai.com/v1"
        model_name = "gpt-3.5-turbo"

    try:
        response = openai.ChatCompletion.create(
            model=model_name,
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': question},
            ],
            temperature=0.7,
            max_tokens=400,
            timeout=API_TIMEOUT,
        )

        return response.choices[0].message.content.strip()
    except Exception as error:
        # If Groq fails, try to fall back to standard OpenAI if it is not a Groq key
        if is_groq:
            return f'Groq request failed: {error}'
        try:
            openai.api_base = "https://api.openai.com/v1"
            response = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': question},
                ],
                temperature=0.7,
                max_tokens=400,
            )
            return response.choices[0].message.content.strip()
        except Exception as fallback_error:
            return f'Request failed: {error} (fallback: {fallback_error})'
