# AR AnatomyAI

AR AnatomyAI is a React + Vite app for learning anatomy with AR content, quizzes, and progress tracking.

## Project layout
- Frontend app: src
- Quiz API (FastAPI): backend/quiz
- Static assets: public (quiz assets live in public/organs and public/human-body.png)

## Frontend setup
1. Install dependencies:
	```bash
	npm install
	```
2. Start the dev server:
	```bash
	npm run dev
	```

## Quiz API setup
1. Create and activate a virtual environment:
	```bash
	cd backend/quiz
	python -m venv .venv
	source .venv/bin/activate
	```
2. Install dependencies:
	```bash
	pip install -r requirements.txt
	```
3. Set the Gemini API key:
	```bash
	export GEMINI_API_KEY="your_key"
	```
4. Initialize the database:
	```bash
	python -m app.init_db
	```
5. Run the API:
	```bash
	uvicorn app.main:app --reload
	```

## Environment variables
- VITE_QUIZ_API_BASE_URL (optional, default http://127.0.0.1:8000)
