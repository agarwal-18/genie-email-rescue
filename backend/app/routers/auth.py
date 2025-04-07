
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from ..database import supabase
from ..models import Token, UserCreate, UserResponse

router = APIRouter(tags=["authentication"])

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Use Supabase to sign in
        auth_response = supabase.auth.sign_in_with_password({"email": form_data.username, "password": form_data.password})
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    try:
        # Check if user exists
        user_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "name": user_data.name
                }
            }
        })
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Format response
        user = user_response.user
        return {
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get("name") if user.user_metadata else None,
            "created_at": user.created_at
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration error: {str(e)}"
        )

@router.get("/auth/me", response_model=UserResponse)
async def get_user_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.user_metadata.get("name") if current_user.user_metadata else None,
        "created_at": current_user.created_at
    }
