import os
import json
from google import genai
from google.genai import types
import openai
from dotenv import load_dotenv

load_dotenv(override=True)
# Trigger reload to pick up new key
# Check for keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Configure Gemini Client if it seems like a Gemini key
if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("gsk_"):
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None

def generate_quiz(organ, difficulty):
    prompt = f"""
Generate exactly 10 anatomy quiz questions about the human {organ}.

Difficulty: {difficulty}

Difficulty Rules:

Easy:
- Basic anatomy facts
- Simple wording
- Direct answers

Medium:
- Conceptual understanding
- Functional anatomy
- Slightly tricky distractors

Hard:
- Clinical reasoning
- Scenario-based questions
- Tricky distractors
- Advanced anatomy knowledge

Question Distribution:

Easy:
- 6 MCQ
- 4 True/False

Medium:
- 4 MCQ
- 2 True/False
- 2 Fill Blank (typing answer)
- 1 Fill Blank with Options
- 1 Match the Following

Hard:
- 3 MCQ
- 2 True/False
- 2 Fill Blank (typing answer)
- 3 Match the Following

Requirements:
- 4 options
- One correct answer
-Randomly place the correct answer among A, B, C, or D
- Do not favor any option position
-No duplicate questions
- Shuffle answer locations across all questions
- Explanation should be concise and informative for the correct answer
- Topic field
- Medical accuracy
- Do not return markdown

Return ONLY valid JSON.

JSON Format:

[
 {{
   "type":"mcq",
   "question":"",
   "options":[
      "A) Option 1",
      "B) Option 2",
      "C) Option 3",
      "D) Option 4"
   ],
   "answer":"A",
   "explanation":"",
   "topic":""
 }},

 {{
   "type":"true_false",
   "question":"",
   "options":[
      "True",
      "False"
   ],
   "answer":"True",
   "explanation":"",
   "topic":""
 }},

 {{
   "type":"fill_blank",
   "question":"The _____ performs a specific function.",
   "answer":"",
   "explanation":"",
   "topic":""
 }},

{{
  "type":"fill_blank_option",
  "question":"The _____ pumps blood throughout the body.",
  "options":[
  "A) Option 1",
      "B) Option 2",
      "C) Option 3",
      "D) Option 4"
    
  ],
  "answer":"A",
  "explanation":"",
  "topic":""
}},
 {{
  "type":"match",
  "question":"Match the following",
  "left":[
    "",
    "",
    ""
  ],
  "right":[
    "",
    "",
    ""
  ],
  "answer": {{
    "item1":"match1",
    "item2":"match2",
    "item3":"match3"
  }},
  "explanation":"",
  "topic":""
}}
]
Rules:
- Every option MUST start with A), B), C), or D)
- Answer MUST be only A, B, C, or D 
-Explanation should be concise and informative for correct answer
-tell the purpose of the wrong answer i click to shortly
- Topic should be short and specific
For image questions:
- Include a valid publicly accessible anatomy image URL
- The image should clearly show the structure being asked about
- Return image_url field
"""

    # Check if we should use Groq
    use_groq = False
    gsk = None

    if GROQ_API_KEY and GROQ_API_KEY.startswith("gsk_"):
        use_groq = True
        gsk = GROQ_API_KEY
    elif GEMINI_API_KEY and GEMINI_API_KEY.startswith("gsk_"):
        use_groq = True
        gsk = GEMINI_API_KEY

    if use_groq:
        client = openai.OpenAI(
            api_key=gsk,
            base_url="https://api.groq.com/openai/v1"
        )
        try:
            print("Generating quiz using Groq...")
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            text = response.choices[0].message.content.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            print(f"Quiz generation with Groq failed: {e}. Falling back to Gemini...")

    # Fallback to Gemini
    if gemini_client is None:
        raise Exception("No valid API keys configured. Set GEMINI_API_KEY or GROQ_API_KEY in your .env.")

    response = gemini_client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    print(text)
    return json.loads(text)

def identify_organ(image_bytes: bytes, mime_type: str):
    prompt = """
    You are an expert anatomy identification AI strictly built for an Anatomy learning project.
    Analyze the provided image and determine if it shows a human body organ (e.g., Heart, Brain, Lungs, Liver, Kidneys, Stomach, etc.). It might be a physical model, a diagram, or a real image.
    
    CRITICAL RULE: If the image is anything OTHER than a human body organ (for example: an animal, a car, a whole human body without focus on a specific organ, a random object, a plant, etc.), you MUST reject it.
    If you reject it or if you are unsure, return EXACTLY this JSON:
    { "error": "This is not a body organ. Please upload an image of a human body organ to proceed." }

    If it IS clearly a human body organ, identify it and return a strictly valid JSON object in this exact format:
    {
        "organ_name": "Heart", // The standard name of the organ
        "description": "A brief 2-3 sentence medical description of the organ and its primary function.",
        "confidence": "High" // High, Medium, Low
    }
    """
    
    gemini_error = None
    # Try Gemini first if we have a client
    if gemini_client is not None:
        try:
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    prompt
                ]
            )
            
            text = response.text.strip()
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            gemini_error = str(e)
            print(f"Gemini Vision failed: {e}. Falling back to OpenAI if available...")
    else:
        gemini_error = "Gemini client not initialized (missing or invalid key prefix)"

    # Fallback to OpenAI Vision
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    if OPENAI_API_KEY.startswith("sk-"):
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        import base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        image_url = f"data:{mime_type};base64,{base64_image}"
        
        try:
            print("Generating vision response using OpenAI gpt-4o...")
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url}
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            text = response.choices[0].message.content.strip()
            return json.loads(text)
        except Exception as e:
            print(f"OpenAI Vision failed: {e}")
            raise Exception(f"Vision analysis failed. Gemini: {gemini_error}. OpenAI: {e}")

    raise Exception(f"Vision analysis failed. Gemini: {gemini_error}. OpenAI: API Key missing or invalid.")