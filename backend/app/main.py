
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, itineraries, weather, places
from .auth import get_current_user
import importlib

app = FastAPI(title="Travel Planner API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fix import issue for auth router
from app.auth import get_current_user
auth.get_current_user = get_current_user

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(itineraries.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(places.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the Travel Planner API"}
