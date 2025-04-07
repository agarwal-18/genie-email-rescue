
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, DateTime, Text, ARRAY, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
import jwt
import uvicorn
from dotenv import load_dotenv
import json
import requests
from uuid import uuid4

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

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    itineraries = relationship("UserItinerary", back_populates="user")

class UserItinerary(Base):
    __tablename__ = "user_itineraries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    days = Column(Integer)
    start_date = Column(DateTime, nullable=True)
    pace = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    interests = Column(ARRAY(String), nullable=True)
    transportation = Column(String, nullable=True)
    include_food = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="itineraries")
    activities = relationship("ItineraryActivity", back_populates="itinerary")

class ItineraryActivity(Base):
    __tablename__ = "itinerary_activities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    itinerary_id = Column(String, ForeignKey("user_itineraries.id"))
    day = Column(Integer)
    time = Column(String)
    title = Column(String)
    location = Column(String)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    itinerary = relationship("UserItinerary", back_populates="activities")

# Create tables
Base.metadata.create_all(bind=engine)

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
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    # This is a simplified example. Use a proper password hashing library in production
    return plain_password == hashed_password  # NEVER do this in production!

def get_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # In production, hash the password
    new_user = User(
        email=user_data.email,
        hashed_password=user_data.password,  # NEVER do this in production!
        name=user_data.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/api/auth/me", response_model=UserResponse)
async def get_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/itineraries", response_model=List[ItineraryResponse])
async def get_user_itineraries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itineraries = db.query(UserItinerary).filter(UserItinerary.user_id == current_user.id).order_by(UserItinerary.updated_at.desc()).all()
    return itineraries

@app.get("/api/itineraries/{itinerary_id}", response_model=ItineraryDetail)
async def get_itinerary_by_id(itinerary_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itinerary = db.query(UserItinerary).filter(UserItinerary.id == itinerary_id, UserItinerary.user_id == current_user.id).first()
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary not found"
        )
    
    activities = db.query(ItineraryActivity).filter(ItineraryActivity.itinerary_id == itinerary_id).order_by(ItineraryActivity.day, ItineraryActivity.time).all()
    
    # Format data
    days = {}
    for activity in activities:
        if activity.day not in days:
            days[activity.day] = {
                "day": activity.day,
                "activities": []
            }
        
        days[activity.day]["activities"].append({
            "time": activity.time,
            "title": activity.title,
            "location": activity.location,
            "description": activity.description or "",
            "image": activity.image,
            "category": activity.category or ""
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
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Create itinerary
    new_itinerary = UserItinerary(
        user_id=current_user.id,
        title=itinerary_data.title,
        days=itinerary_data.days,
        start_date=itinerary_data.start_date,
        pace=itinerary_data.pace,
        budget=itinerary_data.budget,
        interests=itinerary_data.interests,
        transportation=itinerary_data.transportation,
        include_food=itinerary_data.include_food
    )
    db.add(new_itinerary)
    db.commit()
    db.refresh(new_itinerary)
    
    # Create activities
    for day in days:
        for activity in day.activities:
            new_activity = ItineraryActivity(
                itinerary_id=new_itinerary.id,
                day=day.day,
                time=activity.time,
                title=activity.title,
                location=activity.location,
                description=activity.description,
                image=activity.image,
                category=activity.category
            )
            db.add(new_activity)
    
    db.commit()
    return new_itinerary

@app.delete("/api/itineraries/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary(itinerary_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itinerary = db.query(UserItinerary).filter(UserItinerary.id == itinerary_id, UserItinerary.user_id == current_user.id).first()
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary not found"
        )
    
    # Delete associated activities
    db.query(ItineraryActivity).filter(ItineraryActivity.itinerary_id == itinerary_id).delete()
    
    # Delete itinerary
    db.delete(itinerary)
    db.commit()
    return {"status": "success"}

@app.put("/api/itineraries/{itinerary_id}", response_model=ItineraryResponse)
async def update_itinerary(
    itinerary_id: str,
    itinerary_data: ItineraryCreate,
    days: List[ItineraryDay],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(UserItinerary).filter(UserItinerary.id == itinerary_id, UserItinerary.user_id == current_user.id).first()
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Itinerary not found"
        )
    
    # Update itinerary
    itinerary.title = itinerary_data.title
    itinerary.days = itinerary_data.days
    itinerary.start_date = itinerary_data.start_date
    itinerary.pace = itinerary_data.pace
    itinerary.budget = itinerary_data.budget
    itinerary.interests = itinerary_data.interests
    itinerary.transportation = itinerary_data.transportation
    itinerary.include_food = itinerary_data.include_food
    itinerary.updated_at = datetime.utcnow()
    
    # Delete existing activities
    db.query(ItineraryActivity).filter(ItineraryActivity.itinerary_id == itinerary_id).delete()
    
    # Create new activities
    for day in days:
        for activity in day.activities:
            new_activity = ItineraryActivity(
                itinerary_id=itinerary.id,
                day=day.day,
                time=activity.time,
                title=activity.title,
                location=activity.location,
                description=activity.description,
                image=activity.image,
                category=activity.category
            )
            db.add(new_activity)
    
    db.commit()
    db.refresh(itinerary)
    return itinerary

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
    # This would typically fetch from a database
    with open("data/places.json", "r") as f:
        places = json.load(f)
    return places

@app.get("/api/restaurants")
async def get_restaurants():
    # This would typically fetch from a database
    with open("data/restaurants.json", "r") as f:
        restaurants = json.load(f)
    return restaurants

# Data generation endpoints for itineraries
@app.post("/api/generate-itinerary")
async def generate_itinerary(options: Dict[str, Any]):
    # This would implement the logic from lib/data.ts
    # For now, we'll just return a placeholder
    with open("data/itinerary_template.json", "r") as f:
        template = json.load(f)
    
    # Customize the template based on options
    # This is a simplified version of what the actual implementation would do
    days = options.get("days", 3)
    result = []
    
    for day in range(1, days + 1):
        day_data = {
            "day": day,
            "activities": template["activities"][:3]  # Just take the first 3 activities as an example
        }
        result.append(day_data)
    
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
