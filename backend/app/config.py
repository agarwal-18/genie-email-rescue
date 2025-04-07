
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://jsoyxzwtacwkyvbclnqa.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzb3l4end0YWN3a3l2YmNsbnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODc1ODksImV4cCI6MjA1ODY2MzU4OX0.bLwE06v-5m5j_niHjTy8Vc4Dc25vFyjByUaKi0RSW9g")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# API Keys
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "562c360f0d7884a7ec779f34559a11fb")

# Constants
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
