import os
import json
import google.generativeai as genai
import openai
from dotenv import load_dotenv

load_dotenv()

# Check for keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Configure Gemini key if it seems like a Gemini key
if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("gsk_"):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None



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
        openai.api_key = gsk
        openai.api_base = "https://api.groq.com/openai/v1"
        try:
            print("Generating quiz using Groq...")
            response = openai.ChatCompletion.create(
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
    if model is None:
        raise Exception("No valid API keys configured. Set GEMINI_API_KEY or GROQ_API_KEY in your .env.")

    response = model.generate_content(prompt)
    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    print(text)
    return json.loads(text)