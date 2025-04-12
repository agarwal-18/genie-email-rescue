
import json
import os
import uuid
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .config import DATA_DIR

def load_json_data(filename: str) -> Dict[str, Any]:
    """Load JSON data from a file."""
    try:
        file_path = os.path.join(DATA_DIR, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        # Try alternate path
        backup_path = os.path.join(os.path.dirname(os.path.dirname(DATA_DIR)), "data", filename)
        try:
            with open(backup_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())

def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO format."""
    return dt.isoformat() if dt else None

def calculate_travel_time(origin: str, destination: str) -> int:
    """
    Calculate estimated travel time between two locations in minutes.
    For demonstration purposes, this returns a simple estimate.
    In a real app, this would use a mapping API.
    """
    # This is just a placeholder implementation
    # In a real app, you'd use Google Maps, Mapbox or similar API
    return 30  # Default 30 minutes

def is_valid_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def sanitize_input(text: str) -> str:
    """
    Sanitize user input to prevent injection attacks.
    This is a basic implementation - in production you'd use a proper library.
    """
    if not text:
        return ""
    # Replace potentially dangerous characters
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    text = text.replace("'", "&#39;").replace('"', "&quot;")
    return text

def get_date_range(start_date: datetime, days: int) -> List[datetime]:
    """Generate a list of dates starting from start_date for the specified number of days."""
    return [start_date + timedelta(days=i) for i in range(days)]

def format_currency(amount: float, currency: str = "USD") -> str:
    """Format a currency amount."""
    if currency == "USD":
        return f"${amount:.2f}"
    elif currency == "EUR":
        return f"€{amount:.2f}"
    elif currency == "GBP":
        return f"£{amount:.2f}"
    else:
        return f"{amount:.2f} {currency}"

def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split a list into chunks of specified size."""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]

def get_rating_text(rating: float) -> str:
    """Convert numeric rating to descriptive text."""
    if rating >= 4.5:
        return "Excellent"
    elif rating >= 4.0:
        return "Very Good"
    elif rating >= 3.5:
        return "Good"
    elif rating >= 3.0:
        return "Average"
    else:
        return "Below Average"
