
from fastapi import APIRouter, HTTPException, status, Depends
import requests
from typing import Optional
from datetime import datetime, timedelta
import json
from ..config import WEATHER_API_KEY
from ..auth import get_current_user

router = APIRouter(tags=["weather"])

@router.get("/weather")
async def get_weather(city: str):
    """
    Get current weather information for a city.
    """
    api_key = WEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch weather data: {str(e)}"
        )

@router.get("/weather/forecast")
async def get_weather_forecast(city: str, days: Optional[int] = 5):
    """
    Get weather forecast for a city.
    """
    if days < 1 or days > 7:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Days parameter must be between 1 and 7"
        )
    
    api_key = WEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={api_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Process the 3-hour forecast data into daily forecasts
        daily_forecasts = {}
        current_date = datetime.now().date()
        
        for item in data.get('list', []):
            timestamp = datetime.fromtimestamp(item['dt'])
            date = timestamp.date()
            
            # Only include forecast for requested number of days
            if (date - current_date).days >= days:
                continue
                
            if date not in daily_forecasts:
                daily_forecasts[date] = {
                    'date': date.strftime('%Y-%m-%d'),
                    'temp_min': float('inf'),
                    'temp_max': float('-inf'),
                    'humidity': [],
                    'weather_descriptions': [],
                    'icon': None
                }
            
            # Update min/max temperature
            daily_forecasts[date]['temp_min'] = min(daily_forecasts[date]['temp_min'], item['main']['temp_min'])
            daily_forecasts[date]['temp_max'] = max(daily_forecasts[date]['temp_max'], item['main']['temp_max'])
            
            # Add humidity
            daily_forecasts[date]['humidity'].append(item['main']['humidity'])
            
            # Add weather description
            description = item['weather'][0]['description']
            if description not in daily_forecasts[date]['weather_descriptions']:
                daily_forecasts[date]['weather_descriptions'].append(description)
            
            # Use noon weather icon as the daily icon
            if timestamp.hour >= 12 and timestamp.hour < 15 and not daily_forecasts[date]['icon']:
                daily_forecasts[date]['icon'] = item['weather'][0]['icon']
        
        # Calculate average humidity and format the result
        result = []
        for date, forecast in sorted(daily_forecasts.items()):
            if forecast['humidity']:
                forecast['humidity'] = sum(forecast['humidity']) // len(forecast['humidity'])
            result.append(forecast)
        
        return result
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch weather forecast: {str(e)}"
        )

@router.get("/weather/recommendation")
async def get_weather_recommendation(city: str):
    """
    Get travel recommendations based on current weather.
    """
    # First get the current weather
    api_key = WEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        weather_data = response.json()
        
        # Extract relevant weather information
        temp = weather_data['main']['temp']
        weather_id = weather_data['weather'][0]['id']
        weather_main = weather_data['weather'][0]['main']
        
        # Generate recommendations based on weather
        indoor_activities = [
            "Visit a museum or art gallery",
            "Explore local shopping centers",
            "Try local cuisine at indoor restaurants",
            "Visit historical buildings or monuments",
            "Check out local theaters or cinemas"
        ]
        
        outdoor_activities = [
            "Visit parks and gardens",
            "Take a walking tour of the city",
            "Explore outdoor markets",
            "Visit beaches or lakes",
            "Hike in nearby natural areas"
        ]
        
        recommendations = {
            "temperature": temp,
            "weather": weather_main,
            "recommendation": "",
            "suggested_activities": []
        }
        
        # Weather conditions based recommendations
        if weather_id >= 200 and weather_id < 600:  # Thunderstorm, Drizzle, Rain, Snow
            recommendations["recommendation"] = "It's not the best weather for outdoor activities. Consider indoor options today."
            recommendations["suggested_activities"] = indoor_activities
        elif weather_id >= 600 and weather_id < 700:  # Snow
            if temp > 0:
                recommendations["recommendation"] = "It's snowing but not too cold. Enjoy the winter scenery but have indoor backup plans."
                recommendations["suggested_activities"] = indoor_activities + ["Take photos of snowy landmarks", "Build a snowman in a local park"]
            else:
                recommendations["recommendation"] = "It's cold and snowing. Best to stick to indoor activities today."
                recommendations["suggested_activities"] = indoor_activities
        elif weather_id >= 700 and weather_id < 800:  # Atmosphere (fog, haze, etc.)
            recommendations["recommendation"] = "Visibility might be limited. Plan for activities that don't require clear views."
            recommendations["suggested_activities"] = indoor_activities + ["Take a guided tour", "Visit nearby attractions"]
        elif weather_id == 800:  # Clear sky
            if temp > 30:
                recommendations["recommendation"] = "It's clear but very hot. Stay hydrated and seek shade during outdoor activities."
                recommendations["suggested_activities"] = ["Visit air-conditioned museums", "Enjoy water activities", "Have a picnic in shaded areas"]
            elif temp > 15:
                recommendations["recommendation"] = "Perfect weather for exploring outdoors!"
                recommendations["suggested_activities"] = outdoor_activities
            else:
                recommendations["recommendation"] = "It's clear but cool. Dress in layers for outdoor activities."
                recommendations["suggested_activities"] = outdoor_activities
        else:  # Clouds
            recommendations["recommendation"] = "Partly cloudy conditions, generally good for both indoor and outdoor activities."
            recommendations["suggested_activities"] = outdoor_activities + indoor_activities[:2]
        
        return recommendations
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate weather recommendation: {str(e)}"
        )
