
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from ..utils import load_json_data

router = APIRouter(tags=["places"])

@router.get("/places")
async def get_places():
    places = load_json_data("places.json")
    if not places:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Places data file not found"
        )
    return places

@router.get("/restaurants")
async def get_restaurants():
    restaurants = load_json_data("restaurants.json")
    if not restaurants:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Restaurants data file not found"
        )
    return restaurants

@router.post("/generate-itinerary")
async def generate_itinerary(options: Dict[str, Any]):
    # Load template from file
    template = load_json_data("itinerary_template.json")
    if not template:
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
