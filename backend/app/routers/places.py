
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Optional
from ..utils import load_json_data
from ..database import supabase
from ..auth import get_current_user

router = APIRouter(tags=["places"])

@router.get("/places")
async def get_places():
    """
    Get a list of popular places and attractions.
    """
    places = load_json_data("places.json")
    if not places:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Places data file not found"
        )
    return places

@router.get("/locations")
async def get_locations():
    """
    Get a list of all available locations in Navi Mumbai.
    """
    places = load_json_data("places.json")
    if not places:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Places data file not found"
        )
    
    # Extract unique locations
    locations = set()
    for place in places.get("places", []):
        if "location" in place:
            locations.add(place["location"])
    
    return {"locations": sorted(list(locations))}

@router.get("/restaurants")
async def get_restaurants():
    """
    Get a list of restaurants and eateries.
    """
    restaurants = load_json_data("restaurants.json")
    if not restaurants:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Restaurants data file not found"
        )
    return restaurants

@router.get("/places/nearby")
async def get_nearby_places(lat: float, lng: float, radius: Optional[int] = 5000):
    """
    Get places near a specific location.
    """
    # For demo purposes, just return all places with a distance calculation added
    places = load_json_data("places.json")
    if not places:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Places data file not found"
        )
    
    # In a real implementation, you would calculate actual distances
    # or use a geospatial database query
    import random
    for place in places.get("places", []):
        place["distance"] = random.randint(100, radius)
    
    # Filter places within radius
    nearby = [p for p in places.get("places", []) if p.get("distance", 0) <= radius]
    return nearby

@router.post("/generate-itinerary")
async def generate_itinerary(options: Dict[str, Any]):
    """
    Generate a custom itinerary based on user preferences.
    """
    # Load template from file
    template = load_json_data("itinerary_template.json")
    if not template:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Itinerary template file not found"
        )
    
    # Customize the template based on options
    days = options.get("days", 3)
    pace = options.get("pace", "moderate")
    interests = options.get("interests", [])
    
    result = []
    
    # For a real implementation, you would have a more sophisticated
    # algorithm to generate the itinerary based on interests, pace, etc.
    for day in range(1, days + 1):
        # Adjust number of activities based on pace
        activities_per_day = 3  # Default for moderate pace
        if pace == "relaxed":
            activities_per_day = 2
        elif pace == "intensive":
            activities_per_day = 4
        
        # In a real implementation, you would select activities 
        # based on interests and other factors
        day_activities = template.get("activities", [])[:activities_per_day]
        
        day_data = {
            "day": day,
            "activities": day_activities
        }
        result.append(day_data)
    
    return result

@router.get("/places/search")
async def search_places(query: str, category: Optional[str] = None):
    """
    Search for places by name or description.
    """
    places = load_json_data("places.json")
    if not places:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Places data file not found"
        )
    
    # Simple search implementation
    query = query.lower()
    results = []
    
    for place in places.get("places", []):
        name = place.get("name", "").lower()
        description = place.get("description", "").lower()
        place_category = place.get("category", "").lower()
        
        if query in name or query in description:
            if category is None or (category and category.lower() == place_category):
                results.append(place)
    
    return results
