
# Python Backend for Travel Planner

This is the Python backend for the Travel Planner app, built with FastAPI and the Supabase Python SDK.

## Project Structure

- `app/` - Main application package
  - `__init__.py` - Package initialization
  - `main.py` - FastAPI application setup
  - `config.py` - Configuration and environment variables
  - `database.py` - Supabase client initialization
  - `models.py` - Pydantic models for request/response validation
  - `auth.py` - Authentication utilities
  - `utils.py` - Utility functions
  - `routers/` - API route handlers
    - `auth.py` - Authentication routes
    - `itineraries.py` - Itinerary management routes
    - `weather.py` - Weather API integration
    - `places.py` - Places and restaurants data
- `data/` - JSON data files
- `main.py` - Application entry point
- `requirements.txt` - Python dependencies

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
python main.py
```

## API Documentation

Once the server is running, you can access the automatic API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Supabase Integration

This backend uses the Supabase Python SDK to interact with your Supabase project. It handles:

- User authentication (login, registration)
- Storing and retrieving itineraries
- Managing itinerary activities

Make sure your Supabase project has the following tables set up:
- user_itineraries
- itinerary_activities
