
@echo off
echo Starting Python backend and React frontend...

start cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python main.py"
start cmd /k "npm run dev"

echo Servers started. Press Ctrl+C in each window to stop the servers.
