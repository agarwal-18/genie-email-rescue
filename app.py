
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import jwt
import datetime
import random
import string
from werkzeug.security import generate_password_hash, check_password_hash
from supabase import create_client, Client
from functools import wraps
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Supabase client
supabase_url = os.getenv("SUPABASE_URL", "https://jsoyxzwtacwkyvbclnqa.supabase.co")
supabase_key = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzb3l4end0YWN3a3l2YmNsbnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODc1ODksImV4cCI6MjA1ODY2MzU4OX0.bLwE06v-5m5j_niHjTy8Vc4Dc25vFyjByUaKi0RSW9g")
supabase: Client = create_client(supabase_url, supabase_key)

# Secret key for JWT
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "562c360f0d7884a7ec779f34559a11fb")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# Functions to load data
def load_json_data(filename):
    """Load JSON data from a file."""
    try:
        file_path = os.path.join(DATA_DIR, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        # Try alternate path
        backup_path = os.path.join(os.path.dirname(DATA_DIR), "data", filename)
        try:
            with open(backup_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            # Verify the JWT token using Supabase
            user = supabase.auth.get_user(token)
            if not user:
                return jsonify({'message': 'Invalid token!'}), 401
                
            return f(user.user, *args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Could not validate credentials', 'error': str(e)}), 401
            
    return decorated

def generate_verification_code():
    """Generate a random 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))

# Auth routes
@app.route('/api/token', methods=['POST'])
def login_for_access_token():
    auth_data = request.form
    email = auth_data.get('username')
    password = auth_data.get('password')
    
    if not email or not password:
        return jsonify({'detail': 'Email and password are required'}), 400
        
    try:
        # Use Supabase to sign in
        auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        
        if not auth_response.user:
            return jsonify({'detail': 'Incorrect email or password'}), 401
        
        return jsonify({
            "access_token": auth_response.session.access_token,
            "token_type": "bearer"
        })
    except Exception as e:
        return jsonify({'detail': f'Authentication error: {str(e)}'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    user_data = request.json
    
    if not user_data or not user_data.get('email') or not user_data.get('password'):
        return jsonify({'detail': 'Email and password are required'}), 400
    
    try:
        # Create user with email confirmation enabled
        user_response = supabase.auth.sign_up({
            "email": user_data.get('email'),
            "password": user_data.get('password'),
            "options": {
                "data": {
                    "name": user_data.get('name')
                }
            }
        })
        
        if not user_response.user:
            return jsonify({'detail': 'Failed to create user'}), 400
        
        # Format response
        user = user_response.user
        return jsonify({
            "id": user.id,
            "email": user.email,
            "name": user.user_metadata.get("name") if user.user_metadata else None,
            "created_at": user.created_at
        })
    except Exception as e:
        return jsonify({'detail': f'Registration error: {str(e)}'}), 400

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_user_me(current_user):
    return jsonify({
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.user_metadata.get("name") if current_user.user_metadata else None,
        "created_at": current_user.created_at
    })

@app.route('/api/auth/verify-email', methods=['POST'])
def verify_email():
    data = request.json
    email = data.get('email')
    code = data.get('verification_code')
    
    if not email or not code:
        return jsonify({'detail': 'Email and verification code are required'}), 400
    
    try:
        # In a real implementation, you would verify the code
        # For now, we'll just simulate successful verification
        return jsonify({'message': 'Email successfully verified'})
    except Exception as e:
        return jsonify({'detail': f'Verification error: {str(e)}'}), 400

@app.route('/api/auth/resend-verification', methods=['POST'])
def resend_verification():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'detail': 'Email is required'}), 400
    
    try:
        # In a real implementation, you would resend verification code
        # For now, we'll just simulate successful resend
        return jsonify({'message': 'Verification code resent'})
    except Exception as e:
        return jsonify({'detail': f'Failed to resend verification: {str(e)}'}), 400

# Places routes
@app.route('/api/places', methods=['GET'])
def get_places():
    """Get a list of popular places and attractions."""
    places = load_json_data("places.json")
    if not places:
        return jsonify({'detail': 'Places data file not found'}), 500
    return jsonify(places)

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """Get a list of restaurants and eateries."""
    restaurants = load_json_data("restaurants.json")
    if not restaurants:
        return jsonify({'detail': 'Restaurants data file not found'}), 500
    return jsonify(restaurants)

@app.route('/api/places/nearby', methods=['GET'])
def get_nearby_places():
    """Get places near a specific location."""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', default=5000, type=int)
    
    if not lat or not lng:
        return jsonify({'detail': 'Latitude and longitude are required'}), 400
    
    places = load_json_data("places.json")
    if not places:
        return jsonify({'detail': 'Places data file not found'}), 500
    
    # Simulate distance calculation
    import random
    for place in places:
        place["distance"] = random.randint(100, radius)
    
    # Filter places within radius
    nearby = [p for p in places if p.get("distance", 0) <= radius]
    return jsonify(nearby)

@app.route('/api/generate-itinerary', methods=['POST'])
def generate_itinerary():
    """Generate a custom itinerary based on user preferences."""
    options = request.json
    
    if not options:
        return jsonify({'detail': 'Options are required'}), 400
    
    # Load template from file
    template = load_json_data("itinerary_template.json")
    if not template:
        return jsonify({'detail': 'Itinerary template file not found'}), 500
    
    # Customize the template based on options
    days = options.get("days", 3)
    pace = options.get("pace", "moderate")
    interests = options.get("interests", [])
    
    result = []
    
    # Generate itinerary
    for day in range(1, days + 1):
        # Adjust number of activities based on pace
        activities_per_day = 3  # Default for moderate pace
        if pace == "relaxed":
            activities_per_day = 2
        elif pace == "intensive":
            activities_per_day = 4
        
        day_activities = template.get("activities", [])[:activities_per_day]
        
        day_data = {
            "day": day,
            "activities": day_activities
        }
        result.append(day_data)
    
    return jsonify(result)

@app.route('/api/places/search', methods=['GET'])
def search_places():
    """Search for places by name or description."""
    query = request.args.get('query')
    category = request.args.get('category')
    
    if not query:
        return jsonify({'detail': 'Search query is required'}), 400
    
    places = load_json_data("places.json")
    if not places:
        return jsonify({'detail': 'Places data file not found'}), 500
    
    # Simple search implementation
    query = query.lower()
    results = []
    
    for place in places:
        name = place.get("name", "").lower()
        description = place.get("description", "").lower()
        place_category = place.get("category", "").lower()
        
        if query in name or query in description:
            if category is None or (category and category.lower() == place_category):
                results.append(place)
    
    return jsonify(results)

# Profile routes
@app.route('/api/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    """Get the current user's profile information."""
    try:
        return jsonify({
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.user_metadata.get("name") if current_user.user_metadata else None,
            "created_at": current_user.created_at,
            "location": current_user.user_metadata.get("location") if current_user.user_metadata else None,
            "bio": current_user.user_metadata.get("bio") if current_user.user_metadata else None,
            "avatar_url": current_user.user_metadata.get("avatar_url") if current_user.user_metadata else None
        })
    except Exception as e:
        return jsonify({'detail': f'Failed to fetch user profile: {str(e)}'}), 500

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    """Update the current user's profile information."""
    profile_data = request.json
    
    if not profile_data:
        return jsonify({'detail': 'Profile data is required'}), 400
    
    try:
        # Sanitize inputs
        name = profile_data.get('name')
        location = profile_data.get('location')
        bio = profile_data.get('bio')
        avatar_url = profile_data.get('avatar_url')
        
        # Prepare updated metadata
        updated_metadata = {}
        
        # Only update fields that are provided
        if name is not None:
            updated_metadata["name"] = name
        
        if location is not None:
            updated_metadata["location"] = location
            
        if bio is not None:
            updated_metadata["bio"] = bio
            
        if avatar_url is not None:
            updated_metadata["avatar_url"] = avatar_url
        
        # Use Supabase to update user metadata
        response = supabase.auth.admin.update_user_by_id(
            current_user.id,
            user_metadata=updated_metadata
        )
        
        if not response.user:
            return jsonify({'detail': 'Failed to update user profile'}), 500
        
        return jsonify({
            "id": response.user.id,
            "email": response.user.email,
            "name": response.user.user_metadata.get("name") if response.user.user_metadata else None,
            "created_at": response.user.created_at,
            "location": response.user.user_metadata.get("location") if response.user.user_metadata else None,
            "bio": response.user.user_metadata.get("bio") if response.user.user_metadata else None,
            "avatar_url": response.user.user_metadata.get("avatar_url") if response.user.user_metadata else None
        })
    except Exception as e:
        return jsonify({'detail': f'Failed to update user profile: {str(e)}'}), 500

@app.route('/api/profile/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    """Get statistics about the user's activity."""
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
        
        # For forum posts, use a default value
        forum_posts_count = 8  # Default placeholder
        
        return jsonify({
            "saved_itineraries": itineraries_count,
            "forum_posts": forum_posts_count,
            "hours_explored": hours_explored
        })
    except Exception as e:
        return jsonify({'detail': f'Failed to fetch user stats: {str(e)}'}), 500

# Weather routes
@app.route('/api/weather', methods=['GET'])
def get_weather():
    """Get current weather information for a city."""
    city = request.args.get('city')
    
    if not city:
        return jsonify({'detail': 'City is required'}), 400
    
    api_key = WEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    
    try:
        import requests
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'detail': f'Failed to fetch weather data: {str(e)}'}), 500

@app.route('/api/weather/forecast', methods=['GET'])
def get_weather_forecast():
    """Get weather forecast for a city."""
    city = request.args.get('city')
    days = request.args.get('days', default=5, type=int)
    
    if not city:
        return jsonify({'detail': 'City is required'}), 400
    
    if days < 1 or days > 7:
        return jsonify({'detail': 'Days parameter must be between 1 and 7'}), 400
    
    api_key = WEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={api_key}"
    
    try:
        import requests
        from datetime import datetime
        
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Process the 3-hour forecast data into daily forecasts
        daily_forecasts = {}
        current_date = datetime.now().date()
        
        for item in data.get('list', []):
            timestamp = datetime.fromtimestamp(item['dt'])
            date = timestamp.date()
            
            # Only include forecast for requested number of days
            if (date - current_date).days >= days:
                continue
                
            if date not in daily_forecasts:
                daily_forecasts[date] = {
                    'date': date.strftime('%Y-%m-%d'),
                    'temp_min': float('inf'),
                    'temp_max': float('-inf'),
                    'humidity': [],
                    'weather_descriptions': [],
                    'icon': None
                }
            
            # Update min/max temperature
            daily_forecasts[date]['temp_min'] = min(daily_forecasts[date]['temp_min'], item['main']['temp_min'])
            daily_forecasts[date]['temp_max'] = max(daily_forecasts[date]['temp_max'], item['main']['temp_max'])
            
            # Add humidity
            daily_forecasts[date]['humidity'].append(item['main']['humidity'])
            
            # Add weather description
            description = item['weather'][0]['description']
            if description not in daily_forecasts[date]['weather_descriptions']:
                daily_forecasts[date]['weather_descriptions'].append(description)
            
            # Use noon weather icon as the daily icon
            if timestamp.hour >= 12 and timestamp.hour < 15 and not daily_forecasts[date]['icon']:
                daily_forecasts[date]['icon'] = item['weather'][0]['icon']
        
        # Calculate average humidity and format the result
        result = []
        for date, forecast in sorted(daily_forecasts.items()):
            if forecast['humidity']:
                forecast['humidity'] = sum(forecast['humidity']) // len(forecast['humidity'])
            result.append(forecast)
        
        return jsonify(result)
        
    except requests.exceptions.RequestException as e:
        return jsonify({'detail': f'Failed to fetch weather forecast: {str(e)}'}), 500

@app.route('/api/weather/recommendation', methods=['GET'])
def get_weather_recommendation():
    """Get travel recommendations based on current weather."""
    city = request.args.get('city')
    
    if not city:
        return jsonify({'detail': 'City is required'}), 400
    
    # First get the current weather
    api_key = WEATHER_API_KEY
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={api_key}"
    
    try:
        import requests
        response = requests.get(url)
        response.raise_for_status()
        weather_data = response.json()
        
        # Extract relevant weather information
        temp = weather_data['main']['temp']
        weather_id = weather_data['weather'][0]['id']
        weather_main = weather_data['weather'][0]['main']
        
        # Generate recommendations based on weather
        indoor_activities = [
            "Visit a museum or art gallery",
            "Explore local shopping centers",
            "Try local cuisine at indoor restaurants",
            "Visit historical buildings or monuments",
            "Check out local theaters or cinemas"
        ]
        
        outdoor_activities = [
            "Visit parks and gardens",
            "Take a walking tour of the city",
            "Explore outdoor markets",
            "Visit beaches or lakes",
            "Hike in nearby natural areas"
        ]
        
        recommendations = {
            "temperature": temp,
            "weather": weather_main,
            "recommendation": "",
            "suggested_activities": []
        }
        
        # Weather conditions based recommendations
        if weather_id >= 200 and weather_id < 600:  # Thunderstorm, Drizzle, Rain, Snow
            recommendations["recommendation"] = "It's not the best weather for outdoor activities. Consider indoor options today."
            recommendations["suggested_activities"] = indoor_activities
        elif weather_id >= 600 and weather_id < 700:  # Snow
            if temp > 0:
                recommendations["recommendation"] = "It's snowing but not too cold. Enjoy the winter scenery but have indoor backup plans."
                recommendations["suggested_activities"] = indoor_activities + ["Take photos of snowy landmarks", "Build a snowman in a local park"]
            else:
                recommendations["recommendation"] = "It's cold and snowing. Best to stick to indoor activities today."
                recommendations["suggested_activities"] = indoor_activities
        elif weather_id >= 700 and weather_id < 800:  # Atmosphere (fog, haze, etc.)
            recommendations["recommendation"] = "Visibility might be limited. Plan for activities that don't require clear views."
            recommendations["suggested_activities"] = indoor_activities + ["Take a guided tour", "Visit nearby attractions"]
        elif weather_id == 800:  # Clear sky
            if temp > 30:
                recommendations["recommendation"] = "It's clear but very hot. Stay hydrated and seek shade during outdoor activities."
                recommendations["suggested_activities"] = ["Visit air-conditioned museums", "Enjoy water activities", "Have a picnic in shaded areas"]
            elif temp > 15:
                recommendations["recommendation"] = "Perfect weather for exploring outdoors!"
                recommendations["suggested_activities"] = outdoor_activities
            else:
                recommendations["recommendation"] = "It's clear but cool. Dress in layers for outdoor activities."
                recommendations["suggested_activities"] = outdoor_activities
        else:  # Clouds
            recommendations["recommendation"] = "Partly cloudy conditions, generally good for both indoor and outdoor activities."
            recommendations["suggested_activities"] = outdoor_activities + indoor_activities[:2]
        
        return jsonify(recommendations)
        
    except requests.exceptions.RequestException as e:
        return jsonify({'detail': f'Failed to generate weather recommendation: {str(e)}'}), 500

# Itinerary routes
@app.route('/api/itineraries', methods=['GET'])
@token_required
def get_user_itineraries(current_user):
    # Use Supabase to fetch user itineraries
    response = supabase.table("user_itineraries").select("*").eq("user_id", current_user.id).order("updated_at", desc=True).execute()
    
    if not response.data:
        return jsonify([])
    
    return jsonify(response.data)

@app.route('/api/itineraries/<itinerary_id>', methods=['GET'])
@token_required
def get_itinerary_by_id(current_user, itinerary_id):
    # Get itinerary details
    itinerary_response = supabase.table("user_itineraries").select("*").eq("id", itinerary_id).eq("user_id", current_user.id).execute()
    
    if not itinerary_response.data or len(itinerary_response.data) == 0:
        return jsonify({'detail': 'Itinerary not found'}), 404
    
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
    
    return jsonify({
        "details": itinerary,
        "days": formatted_days
    })

@app.route('/api/itineraries', methods=['POST'])
@token_required
def create_itinerary(current_user):
    data = request.json
    itinerary_data = data.get('itinerary_data')
    days = data.get('days')
    
    if not itinerary_data or not days:
        return jsonify({'detail': 'Itinerary data and days are required'}), 400
    
    import uuid
    
    # Create itinerary
    itinerary_id = str(uuid.uuid4())
    itinerary = {
        "id": itinerary_id,
        "user_id": current_user.id,
        "title": itinerary_data.get('title'),
        "days": itinerary_data.get('days'),
        "start_date": itinerary_data.get('start_date'),
        "pace": itinerary_data.get('pace'),
        "budget": itinerary_data.get('budget'),
        "interests": itinerary_data.get('interests'),
        "transportation": itinerary_data.get('transportation'),
        "include_food": itinerary_data.get('include_food', True)
    }
    
    itinerary_response = supabase.table("user_itineraries").insert(itinerary).execute()
    
    if not itinerary_response.data or len(itinerary_response.data) == 0:
        return jsonify({'detail': 'Failed to create itinerary'}), 500
    
    # Create activities
    activities = []
    for day in days:
        for activity in day.get('activities', []):
            activities.append({
                "id": str(uuid.uuid4()),
                "itinerary_id": itinerary_id,
                "day": day.get('day'),
                "time": activity.get('time'),
                "title": activity.get('title'),
                "location": activity.get('location'),
                "description": activity.get('description'),
                "image": activity.get('image'),
                "category": activity.get('category')
            })
    
    if activities:
        supabase.table("itinerary_activities").insert(activities).execute()
    
    return jsonify(itinerary_response.data[0])

@app.route('/api/itineraries/<itinerary_id>', methods=['DELETE'])
@token_required
def delete_itinerary(current_user, itinerary_id):
    # First check if the itinerary exists and belongs to the user
    check_response = supabase.table("user_itineraries").select("id").eq("id", itinerary_id).eq("user_id", current_user.id).execute()
    
    if not check_response.data or len(check_response.data) == 0:
        return jsonify({'detail': 'Itinerary not found'}), 404
    
    # Delete activities
    supabase.table("itinerary_activities").delete().eq("itinerary_id", itinerary_id).execute()
    
    # Delete itinerary
    supabase.table("user_itineraries").delete().eq("id", itinerary_id).execute()
    
    return jsonify({"status": "success"}), 204

@app.route('/api/itineraries/<itinerary_id>', methods=['PUT'])
@token_required
def update_itinerary(current_user, itinerary_id):
    data = request.json
    itinerary_data = data.get('itinerary_data')
    days = data.get('days')
    
    if not itinerary_data or not days:
        return jsonify({'detail': 'Itinerary data and days are required'}), 400
    
    # Check if itinerary exists and belongs to user
    check_response = supabase.table("user_itineraries").select("id").eq("id", itinerary_id).eq("user_id", current_user.id).execute()
    
    if not check_response.data or len(check_response.data) == 0:
        return jsonify({'detail': 'Itinerary not found'}), 404
    
    from datetime import datetime
    import uuid
    
    # Update itinerary
    itinerary = {
        "title": itinerary_data.get('title'),
        "days": itinerary_data.get('days'),
        "start_date": itinerary_data.get('start_date'),
        "pace": itinerary_data.get('pace'),
        "budget": itinerary_data.get('budget'),
        "interests": itinerary_data.get('interests'),
        "transportation": itinerary_data.get('transportation'),
        "include_food": itinerary_data.get('include_food', True),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    itinerary_response = supabase.table("user_itineraries").update(itinerary).eq("id", itinerary_id).execute()
    
    if not itinerary_response.data or len(itinerary_response.data) == 0:
        return jsonify({'detail': 'Failed to update itinerary'}), 500
    
    # Delete existing activities
    supabase.table("itinerary_activities").delete().eq("itinerary_id", itinerary_id).execute()
    
    # Create new activities
    activities = []
    for day in days:
        for activity in day.get('activities', []):
            activities.append({
                "id": str(uuid.uuid4()),
                "itinerary_id": itinerary_id,
                "day": day.get('day'),
                "time": activity.get('time'),
                "title": activity.get('title'),
                "location": activity.get('location'),
                "description": activity.get('description'),
                "image": activity.get('image'),
                "category": activity.get('category')
            })
    
    if activities:
        supabase.table("itinerary_activities").insert(activities).execute()
    
    return jsonify(itinerary_response.data[0])

# Main route for health check
@app.route('/')
def root():
    return jsonify({"message": "Welcome to the Travel Planner API"})

@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "api": "Travel Planner API",
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
