
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .database import supabase

# Authentication token setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication utilities
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the JWT token using Supabase
        user = supabase.auth.get_user(token)
        if not user:
            raise credentials_exception
        return user.user
    except Exception:
        raise credentials_exception
