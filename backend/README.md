
# Python Backend for Travel Planner

This is the Python backend for the Travel Planner app, built with FastAPI and SQLAlchemy.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables (create a `.env` file):
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-here
WEATHER_API_KEY=562c360f0d7884a7ec779f34559a11fb
```

5. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access the automatic API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

- `main.py`: The main application file with all FastAPI routes
- `data/`: Contains JSON data files for places, restaurants, and itinerary templates
- `requirements.txt`: Python dependencies
