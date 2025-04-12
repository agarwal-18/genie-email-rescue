
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime
import uuid
from ..database import supabase
from ..models import ItineraryCreate, ItineraryResponse, ItineraryDetail, ItineraryDay
from ..auth import get_current_user
from ..utils import generate_uuid

router = APIRouter(prefix="/itineraries", tags=["itineraries"])

@router.get("", response_model=List[ItineraryResponse])
async def get_user_itineraries(current_user = Depends(get_current_user)):
    # Use Supabase to fetch user itineraries
    response = supabase.table("user_itineraries").select("*").eq("user_id", current_user.id).order("updated_at", desc=True).execute()
    
    if not response.data:
        return []
    
    return response.data

@router.get("/{itinerary_id}", response_model=ItineraryDetail)
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

@router.post("", response_model=ItineraryResponse)
async def create_itinerary(
    itinerary_data: ItineraryCreate, 
    days: List[ItineraryDay],
    current_user = Depends(get_current_user)
):
    # Create itinerary
    itinerary_id = generate_uuid()
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
                "id": generate_uuid(),
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

@router.delete("/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
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

@router.put("/{itinerary_id}", response_model=ItineraryResponse)
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
                "id": generate_uuid(),
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
