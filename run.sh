
#!/bin/bash

# Start Python backend
cd backend
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
