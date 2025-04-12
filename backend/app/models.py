
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# User models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Itinerary models
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

class ItineraryCreate(BaseModel):
    title: str
    days: int
    start_date: Optional[datetime] = None
    pace: Optional[str] = None
    budget: Optional[str] = None
    interests: Optional[List[str]] = None
    transportation: Optional[str] = None
    include_food: Optional[bool] = True

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

# Weather models
class WeatherRecommendation(BaseModel):
    temperature: float
    weather: str
    recommendation: str
    suggested_activities: List[str]

# Place models
class PlaceCategory(BaseModel):
    id: str
    name: str
    icon: str
    
class Place(BaseModel):
    id: str
    name: str
    location: str
    description: str
    image: str
    rating: float
    category: str
    price_level: Optional[int] = None
    coordinates: Optional[Dict[str, float]] = None
    
class NearbyPlace(Place):
    distance: int
