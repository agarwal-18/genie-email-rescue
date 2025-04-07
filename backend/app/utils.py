
import json
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from .config import DATA_DIR

def load_json_data(filename: str) -> Dict[str, Any]:
    """Load JSON data from a file."""
    try:
        file_path = os.path.join(DATA_DIR, filename)
        with open(file_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Try alternate path
        backup_path = os.path.join(os.path.dirname(os.path.dirname(DATA_DIR)), "data", filename)
        try:
            with open(backup_path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())

def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO format."""
    return dt.isoformat() if dt else None
