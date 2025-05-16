
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List, Optional
from ..utils import load_json_data
from ..database import supabase
from ..auth import get_current_user

router = APIRouter(tags=["places"])

@router.get("/places")
async def get_places(region: Optional[str] = None):
    """
    Get a list of popular places and attractions.
    
    Args:
        region: Optional region filter for places within Maharashtra
    """
    places = load_json_data("places.json")
    if not places:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Places data file not found"
        )
    
    # Filter by region if specified
    if region:
        places = [p for p in places if p.get("region", "Navi Mumbai") == region]
        
    return places

@router.get("/regions")
async def get_regions():
    """
    Get a list of all regions in Maharashtra.
    """
    places = load_json_data("places.json")
    if not places:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Places data file not found"
        )
    
    # Extract unique regions from places data
    regions = []
    for place in places:
        region = place.get("region", "Navi Mumbai")
        if region not in regions:
            regions.append(region)
    
    return {"regions": regions}

@router.get("/restaurants")
async def get_restaurants(region: Optional[str] = None):
    """
    Get a list of restaurants and eateries.
    
    Args:
        region: Optional region filter for restaurants within Maharashtra
    """
    restaurants = load_json_data("restaurants.json")
    if not restaurants:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Restaurants data file not found"
        )
    
    # Filter by region if specified
    if region:
        restaurants = [r for r in restaurants if r.get("region", "Navi Mumbai") == region]
        
    return restaurants

@router.get("/places/nearby")
async def get_nearby_places(lat: float, lng: float, radius: Optional[int] = 5000, region: Optional[str] = None):
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
    
    # Filter by region if specified
    if region:
        places = [p for p in places if p.get("region", "Navi Mumbai") == region]
    
    # In a real implementation, you would calculate actual distances
    # or use a geospatial database query
    import random
    for place in places:
        place["distance"] = random.randint(100, radius)
    
    # Filter places within radius
    nearby = [p for p in places if p.get("distance", 0) <= radius]
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
    regions = options.get("regions", [])  # Added support for multiple regions
    
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
        # based on interests, regions, and other factors
        day_activities = template.get("activities", [])[:activities_per_day]
        
        day_data = {
            "day": day,
            "activities": day_activities
        }
        result.append(day_data)
    
    return result

@router.get("/places/search")
async def search_places(query: str, category: Optional[str] = None, region: Optional[str] = None):
    """
    Search for places by name or description.
    
    Args:
        query: Search term
        category: Optional category filter
        region: Optional region filter
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
    
    for place in places:
        name = place.get("name", "").lower()
        description = place.get("description", "").lower()
        place_category = place.get("category", "").lower()
        place_region = place.get("region", "Navi Mumbai").lower()
        
        # Filter by search term
        if query in name or query in description:
            # Apply category filter if specified
            if category is None or (category and category.lower() == place_category):
                # Apply region filter if specified
                if region is None or (region and region.lower() == place_region):
                    results.append(place)
    
    return results
