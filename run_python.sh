
#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
else
  echo "Using existing Python virtual environment..."
  source venv/bin/activate
fi

# Check if this is a build command
if [ "$1" == "build" ]; then
  echo "Building for production..."
  npm run build
  exit 0
fi

# Start Python backend
python app.py &
BACKEND_PID=$!

# Start frontend
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
