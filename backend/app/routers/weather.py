
from fastapi import APIRouter, HTTPException, status
import requests
from ..config import WEATHER_API_KEY

router = APIRouter(tags=["weather"])

@router.get("/weather")
async def get_weather(city: str):
    # This would typically use environment variables for API keys
    api_key = WEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    
    response = requests.get(url)
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch weather data"
        )
    
    return response.json()
