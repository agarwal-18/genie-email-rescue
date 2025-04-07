
#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
  echo "Creating Python virtual environment..."
  cd backend
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  cd ..
else
  echo "Using existing Python virtual environment..."
  cd backend
  source venv/bin/activate
  cd ..
fi

# Start Python backend
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ..
npm run dev &
FRONTEND_PID=$!

# Function to kill processes on exit
cleanup() {
  echo "Stopping servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Set up trap for graceful shutdown
trap cleanup INT TERM

# Wait for both processes
wait
