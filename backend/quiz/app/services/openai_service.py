import os
import openai
from dotenv import load_dotenv

load_dotenv()

# Use two keys: GEMINI_API_KEY for quiz generator, and GROQ_API_KEY for AITutor.
# Support fallback to OPENAI_API_KEY if specified by the user.
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
API_TIMEOUT = 30

SYSTEM_PROMPT = (
    'You are an educational AI tutor specializing strictly in human anatomy, biology, and related medical sciences. '
    'Answer clearly and simply for a student. '
    'IMPORTANT: If a user asks a question about any other domain (e.g., programming, history, politics, general chit-chat), '
    'you MUST politely decline to answer and remind them that you are an anatomy tutor.'
)

def generate_answer(question: str, conversational_mode: bool = False) -> str:
    if not GROQ_API_KEY:
        return 'Groq/OpenAI API key is missing. Add GROQ_API_KEY to your backend/quiz/.env.'

    is_groq = GROQ_API_KEY.startswith("gsk_")
    if is_groq:
        base_url = "https://api.groq.com/openai/v1"
        model_name = "llama-3.3-70b-versatile"
    else:
        base_url = "https://api.openai.com/v1"
        model_name = "gpt-3.5-turbo"

    client = openai.OpenAI(
        api_key=GROQ_API_KEY,
        base_url=base_url
    )

    prompt_to_use = SYSTEM_PROMPT
    if conversational_mode:
        prompt_to_use += " IMPORTANT: We are in a voice conversation mode. You must keep your answers EXTREMELY concise, like a human speaking on a phone call. Use 1 or 2 short sentences max. Do NOT use markdown formatting."

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {'role': 'system', 'content': prompt_to_use},
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
            fallback_client = openai.OpenAI(
                api_key=GROQ_API_KEY,
                base_url="https://api.openai.com/v1"
            )
            response = fallback_client.chat.completions.create(
                model='gpt-3.5-turbo',
                messages=[
                    {'role': 'system', 'content': prompt_to_use},
                    {'role': 'user', 'content': question},
                ],
                temperature=0.7,
                max_tokens=400,
            )
            return response.choices[0].message.content.strip()
        except Exception as fallback_error:
            return f'Request failed: {error} (fallback: {fallback_error})'
