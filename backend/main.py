
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import json
import requests
from uuid import uuid4
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(title="Travel Planner API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jsoyxzwtacwkyvbclnqa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzb3l4end0YWN3a3l2YmNsbnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODc1ODksImV4cCI6MjA1ODY2MzU4OX0.bLwE06v-5m5j_niHjTy8Vc4Dc25vFyjByUaKi0RSW9g")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Authentication token setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class ItineraryCreate(BaseModel):
    title: str
    days: int
    start_date: Optional[datetime] = None
    pace: Optional[str] = None
    budget: Optional[str] = None
    interests: Optional[List[str]] = None
    transportation: Optional[str] = None
    include_food: Optional[bool] = True

class ItineraryActivity(BaseModel):
    time: str
    title: str
    location: str
    description: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None

class ItineraryDay(BaseModel):
    day: int
    activities: List[ItineraryActivity]

class ItineraryResponse(BaseModel):
    id: str
    title: str
    days: int
    start_date: Optional[datetime] = None
    pace: Optional[str] = None
    budget: Optional[str] = None
    interests: Optional[List[str]] = None
    transportation: Optional[str] = None
    include_food: Optional[bool] = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class ItineraryDetail(BaseModel):
    details: ItineraryResponse
    days: List[ItineraryDay]

# Authentication utilities
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the JWT token using Supabase
        user = supabase.auth.get_user(token)
        if not user:
            raise credentials_exception
        return user.user
    except Exception:
        raise credentials_exception

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Use Supabase to sign in
        auth_response = supabase.auth.sign_in_with_password({"email": form_data.username, "password": form_data.password})
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    try:
        # Check if user exists
        user_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "name": user_data.name
                }
            }
        })
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Format response
        user = user_response.user
        return {
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get("name") if user.user_metadata else None,
            "created_at": user.created_at
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration error: {str(e)}"
        )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_user_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.user_metadata.get("name") if current_user.user_metadata else None,
        "created_at": current_user.created_at
    }

@app.get("/api/itineraries", response_model=List[ItineraryResponse])
async def get_user_itineraries(current_user = Depends(get_current_user)):
    # Use Supabase to fetch user itineraries
    response = supabase.table("user_itineraries").select("*").eq("user_id", current_user.id).order("updated_at", desc=True).execute()
    
    if not response.data:
        return []
    
    return response.data

@app.get("/api/itineraries/{itinerary_id}", response_model=ItineraryDetail)
async def get_itinerary_by_id(itinerary_id: str, current_user = Depends(get_current_user)):
    # Get itinerary details
    itinerary_response = supabase.table("user_itineraries").select("*").eq("id", itinerary_id).eq("user_id", current_user.id).execute()
    
    if not itinerary_response.data or len(itinerary_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary not found"
        )
    
    itinerary = itinerary_response.data[0]
    
    # Get activities
    activities_response = supabase.table("itinerary_activities").select("*").eq("itinerary_id", itinerary_id).order("day").order("time").execute()
    activities = activities_response.data or []
    
    # Format data
    days = {}
    for activity in activities:
        if activity["day"] not in days:
            days[activity["day"]] = {
                "day": activity["day"],
                "activities": []
            }
        
        days[activity["day"]]["activities"].append({
            "time": activity["time"],
            "title": activity["title"],
            "location": activity["location"],
            "description": activity["description"] or "",
            "image": activity["image"],
            "category": activity["category"] or ""
        })
    
    formatted_days = list(days.values())
    formatted_days.sort(key=lambda x: x["day"])
    
    return {
        "details": itinerary,
        "days": formatted_days
    }

@app.post("/api/itineraries", response_model=ItineraryResponse)
async def create_itinerary(
    itinerary_data: ItineraryCreate, 
    days: List[ItineraryDay],
    current_user = Depends(get_current_user)
):
    # Create itinerary
    itinerary_id = str(uuid4())
    itinerary = {
        "id": itinerary_id,
        "user_id": current_user.id,
        "title": itinerary_data.title,
        "days": itinerary_data.days,
        "start_date": itinerary_data.start_date.isoformat() if itinerary_data.start_date else None,
        "pace": itinerary_data.pace,
        "budget": itinerary_data.budget,
        "interests": itinerary_data.interests,
        "transportation": itinerary_data.transportation,
        "include_food": itinerary_data.include_food
    }
    
    itinerary_response = supabase.table("user_itineraries").insert(itinerary).execute()
    
    if not itinerary_response.data or len(itinerary_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create itinerary"
        )
    
    # Create activities
    activities = []
    for day in days:
        for activity in day.activities:
            activities.append({
                "id": str(uuid4()),
                "itinerary_id": itinerary_id,
                "day": day.day,
                "time": activity.time,
                "title": activity.title,
                "location": activity.location,
                "description": activity.description,
                "image": activity.image,
                "category": activity.category
            })
    
    if activities:
        supabase.table("itinerary_activities").insert(activities).execute()
    
    return itinerary_response.data[0]

@app.delete("/api/itineraries/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary(itinerary_id: str, current_user = Depends(get_current_user)):
    # First check if the itinerary exists and belongs to the user
    check_response = supabase.table("user_itineraries").select("id").eq("id", itinerary_id).eq("user_id", current_user.id).execute()
    
    if not check_response.data or len(check_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary not found"
        )
    
    # Delete activities
    supabase.table("itinerary_activities").delete().eq("itinerary_id", itinerary_id).execute()
    
    # Delete itinerary
    supabase.table("user_itineraries").delete().eq("id", itinerary_id).execute()
    
    return {"status": "success"}

@app.put("/api/itineraries/{itinerary_id}", response_model=ItineraryResponse)
async def update_itinerary(
    itinerary_id: str,
    itinerary_data: ItineraryCreate,
    days: List[ItineraryDay],
    current_user = Depends(get_current_user)
):
    # Check if itinerary exists and belongs to user
    check_response = supabase.table("user_itineraries").select("id").eq("id", itinerary_id).eq("user_id", current_user.id).execute()
    
    if not check_response.data or len(check_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary not found"
        )
    
    # Update itinerary
    itinerary = {
        "title": itinerary_data.title,
        "days": itinerary_data.days,
        "start_date": itinerary_data.start_date.isoformat() if itinerary_data.start_date else None,
        "pace": itinerary_data.pace,
        "budget": itinerary_data.budget,
        "interests": itinerary_data.interests,
        "transportation": itinerary_data.transportation,
        "include_food": itinerary_data.include_food,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    itinerary_response = supabase.table("user_itineraries").update(itinerary).eq("id", itinerary_id).execute()
    
    if not itinerary_response.data or len(itinerary_response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update itinerary"
        )
    
    # Delete existing activities
    supabase.table("itinerary_activities").delete().eq("itinerary_id", itinerary_id).execute()
    
    # Create new activities
    activities = []
    for day in days:
        for activity in day.activities:
            activities.append({
                "id": str(uuid4()),
                "itinerary_id": itinerary_id,
                "day": day.day,
                "time": activity.time,
                "title": activity.title,
                "location": activity.location,
                "description": activity.description,
                "image": activity.image,
                "category": activity.category
            })
    
    if activities:
        supabase.table("itinerary_activities").insert(activities).execute()
    
    return itinerary_response.data[0]

@app.get("/api/weather")
async def get_weather(city: str):
    # This would typically use environment variables for API keys
    api_key = os.getenv("WEATHER_API_KEY", "562c360f0d7884a7ec779f34559a11fb")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch weather data"
        )
    
    return response.json()

@app.get("/api/places")
async def get_places():
    # Load data from file
    try:
        with open("backend/data/places.json", "r") as f:
            places = json.load(f)
        return places
    except FileNotFoundError:
        # If file is not found in the new path, try the original path
        try:
            with open("data/places.json", "r") as f:
                places = json.load(f)
            return places
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Places data file not found"
            )

@app.get("/api/restaurants")
async def get_restaurants():
    # Load data from file
    try:
        with open("backend/data/restaurants.json", "r") as f:
            restaurants = json.load(f)
        return restaurants
    except FileNotFoundError:
        # If file is not found in the new path, try the original path
        try:
            with open("data/restaurants.json", "r") as f:
                restaurants = json.load(f)
            return restaurants
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Restaurants data file not found"
            )

# Data generation endpoints for itineraries
@app.post("/api/generate-itinerary")
async def generate_itinerary(options: Dict[str, Any]):
    # Load template from file
    try:
        with open("backend/data/itinerary_template.json", "r") as f:
            template = json.load(f)
    except FileNotFoundError:
        # If file is not found in the new path, try the original path
        try:
            with open("data/itinerary_template.json", "r") as f:
                template = json.load(f)
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Itinerary template file not found"
            )
    
    # Customize the template based on options
    days = options.get("days", 3)
    result = []
    
    for day in range(1, days + 1):
        day_data = {
            "day": day,
            "activities": template["activities"][:3]  # Just take the first 3 activities as an example
        }
        result.append(day_data)
    
    return result
