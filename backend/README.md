
# Python Backend for Travel Planner

This is the Python backend for the Travel Planner app, built with FastAPI and the Supabase Python SDK.

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
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key (optional)
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

## Supabase Integration

This backend uses the Supabase Python SDK to interact with your Supabase project. It handles:

- User authentication (login, registration)
- Storing and retrieving itineraries
- Managing itinerary activities

Make sure your Supabase project has the following tables set up:
- user_itineraries
- itinerary_activities
