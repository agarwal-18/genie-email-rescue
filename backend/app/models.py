
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# User models
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
