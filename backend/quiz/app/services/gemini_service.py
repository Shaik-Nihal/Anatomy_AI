import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")


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

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    print(text)
    return json.loads(text)