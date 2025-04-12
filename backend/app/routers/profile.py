
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any
from ..database import supabase
from ..models import UserProfileUpdate, UserProfileResponse
from ..auth import get_current_user
from ..utils import sanitize_input, is_valid_email

router = APIRouter(tags=["user_profile"])

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(current_user = Depends(get_current_user)):
    """
    Get the current user's profile information.
    """
    try:
        # Fetch any additional profile info from database if needed
        # For now, we'll just use the info from the auth user
        
        return {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.user_metadata.get("name") if current_user.user_metadata else None,
            "created_at": current_user.created_at,
            "location": current_user.user_metadata.get("location") if current_user.user_metadata else None,
            "bio": current_user.user_metadata.get("bio") if current_user.user_metadata else None,
            "avatar_url": current_user.user_metadata.get("avatar_url") if current_user.user_metadata else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user profile: {str(e)}"
        )

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(profile_data: UserProfileUpdate, current_user = Depends(get_current_user)):
    """
    Update the current user's profile information.
    """
    try:
        # Sanitize inputs
        name = sanitize_input(profile_data.name) if profile_data.name else None
        location = sanitize_input(profile_data.location) if profile_data.location else None
        bio = sanitize_input(profile_data.bio) if profile_data.bio else None
        
        # Prepare updated metadata
        updated_metadata = {}
        
        # Only update fields that are provided
        if name is not None:
            updated_metadata["name"] = name
        
        if location is not None:
            updated_metadata["location"] = location
            
        if bio is not None:
            updated_metadata["bio"] = bio
            
        if profile_data.avatar_url is not None:
            updated_metadata["avatar_url"] = profile_data.avatar_url
        
        # Use Supabase to update user metadata
        response = supabase.auth.admin.update_user_by_id(
            current_user.id,
            user_metadata=updated_metadata
        )
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user profile"
            )
        
        return {
            "id": response.user.id,
            "email": response.user.email,
            "name": response.user.user_metadata.get("name") if response.user.user_metadata else None,
            "created_at": response.user.created_at,
            "location": response.user.user_metadata.get("location") if response.user.user_metadata else None,
            "bio": response.user.user_metadata.get("bio") if response.user.user_metadata else None,
            "avatar_url": response.user.user_metadata.get("avatar_url") if response.user.user_metadata else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )

@router.get("/profile/stats")
async def get_user_stats(current_user = Depends(get_current_user)):
    """
    Get statistics about the user's activity.
    """
    try:
        # Get itineraries count
        itineraries_response = supabase.table("user_itineraries").select("id").eq("user_id", current_user.id).execute()
        itineraries_count = len(itineraries_response.data) if itineraries_response.data else 0
        
        # Get activities count to estimate hours explored
        activities_ids = [item["id"] for item in itineraries_response.data] if itineraries_response.data else []
        
        activities_count = 0
        if activities_ids:
            activities_response = supabase.table("itinerary_activities").select("id").in_("itinerary_id", activities_ids).execute()
            activities_count = len(activities_response.data) if activities_response.data else 0
        
        # Calculate hours explored (estimating 1.5 hours per activity)
        hours_explored = round(activities_count * 1.5)
        
        # For forum posts, this would connect to a forum posts table if it existed
        # For now, use a default value
        forum_posts_count = 8  # Default placeholder
        
        return {
            "saved_itineraries": itineraries_count,
            "forum_posts": forum_posts_count,
            "hours_explored": hours_explored
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user stats: {str(e)}"
        )
