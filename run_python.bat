
@echo off
echo Starting Python Flask backend and React frontend...

start cmd /k "python -m venv venv && venv\Scripts\activate && pip install -r requirements-python.txt && python app.py"
start cmd /k "npm run dev"

echo Servers started. Press Ctrl+C in each window to stop the servers.
