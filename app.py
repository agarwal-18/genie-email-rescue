
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import uuid
from dotenv import load_dotenv
import requests
from functools import wraps
import bcrypt
from dateutil import parser

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='dist')
CORS(app)

# Configuration
SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', 'YOUR_OPENWEATHERMAP_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'YOUR_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'YOUR_SUPABASE_KEY')

# Mock database (replace with actual database in production)
users_db = {}
profiles_db = {}
itineraries_db = {}
activities_db = {}
verification_codes = {}

# Helper function to load JSON data
def load_json_data(filename):
    try:
        with open(f"data/{filename}", 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Warning: Data file {filename} not found")
        return []

# Generate UUID
def generate_uuid():
    return str(uuid.uuid4())

# Sanitize input
def sanitize_input(text):
    if not text:
        return None
    # Basic sanitation - you may want to enhance this
    return text.strip()

# Email validation
def is_valid_email(email):
    # Basic validation - you may want to enhance this
    return '@' in email and '.' in email.split('@')[1]

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = users_db.get(data['id'])
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated

# Authentication routes
@app.route('/api/token', methods=['POST'])
def login():
    auth = request.form
    
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify', 'WWW-Authenticate': 'Bearer'}), 401
        
    email = auth.get('username')
    password = auth.get('password')
    
    # Find user by email
    user = None
    for user_id, user_data in users_db.items():
        if user_data.get('email') == email:
            user = user_data
            user['id'] = user_id
            break
            
    if not user:
        return jsonify({'message': 'User not found', 'WWW-Authenticate': 'Bearer'}), 401
        
    if not user.get('email_verified', False):
        return jsonify({'message': 'Email not verified', 'WWW-Authenticate': 'Bearer'}), 401
        
    if check_password_hash(user.get('password_hash', ''), password):
        # Generate token
        token = jwt.encode({
            'id': user['id'],
            'exp': datetime.utcnow() + timedelta(minutes=30)
        }, SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'access_token': token,
            'token_type': 'bearer'
        }), 200
        
    return jsonify({'message': 'Invalid credentials', 'WWW-Authenticate': 'Bearer'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    
    # Check if email is valid
    if not is_valid_email(email):
        return jsonify({'message': 'Invalid email format'}), 400
        
    # Check if user already exists
    for user in users_db.values():
        if user.get('email') == email:
            return jsonify({'message': 'User already exists'}), 400
            
    # Create new user
    user_id = generate_uuid()
    created_at = datetime.utcnow().isoformat()
    
    # Hash password
    password_hash = generate_password_hash(password)
    
    # Generate verification code
    verification_code = ''.join(secrets.choice('0123456789') for _ in range(6))
    verification_codes[email] = verification_code
    
    # In a real app, you would send this code via email
    print(f"Verification code for {email}: {verification_code}")
    
    # Store user
    users_db[user_id] = {
        'email': email,
        'password_hash': password_hash,
        'created_at': created_at,
        'user_metadata': {
            'name': name
        },
        'email_verified': False
    }
    
    # In a real app, you would send verification email here
    
    return jsonify({
        'id': user_id,
        'email': email,
        'name': name,
        'created_at': created_at
    }), 201

@app.route('/api/auth/verify', methods=['POST'])
def verify_email():
    data = request.json
    
    if not data or not data.get('email') or not data.get('code'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    email = data.get('email')
    code = data.get('code')
    
    # Check if verification code is valid
    if verification_codes.get(email) != code:
        return jsonify({'message': 'Invalid verification code'}), 400
        
    # Update user verification status
    for user_id, user_data in users_db.items():
        if user_data.get('email') == email:
            users_db[user_id]['email_verified'] = True
            del verification_codes[email]
            return jsonify({'message': 'Email verified successfully'}), 200
            
    return jsonify({'message': 'User not found'}), 404

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'id': current_user.get('id'),
        'email': current_user.get('email'),
        'name': current_user.get('user_metadata', {}).get('name'),
        'created_at': current_user.get('created_at')
    }), 200

# Itineraries routes
@app.route('/api/itineraries', methods=['GET'])
@token_required
def get_user_itineraries(current_user):
    user_id = current_user.get('id')
    
    # Get user's itineraries
    user_itineraries = []
    for itinerary_id, itinerary in itineraries_db.items():
        if itinerary.get('user_id') == user_id:
            user_itineraries.append({**itinerary, 'id': itinerary_id})
    
    # Sort by updated_at (most recent first)
    user_itineraries.sort(key=lambda x: parser.parse(x.get('updated_at', x.get('created_at'))), reverse=True)
    
    return jsonify(user_itineraries), 200

@app.route('/api/itineraries/<itinerary_id>', methods=['GET'])
@token_required
def get_itinerary_by_id(current_user, itinerary_id):
    user_id = current_user.get('id')
    
    # Get itinerary
    itinerary = itineraries_db.get(itinerary_id)
    
    if not itinerary or itinerary.get('user_id') != user_id:
        return jsonify({'message': 'Itinerary not found'}), 404
    
    # Get activities for this itinerary
    itinerary_activities = []
    for activity_id, activity in activities_db.items():
        if activity.get('itinerary_id') == itinerary_id:
            itinerary_activities.append({**activity, 'id': activity_id})
    
    # Sort activities by day and time
    itinerary_activities.sort(key=lambda x: (x.get('day', 0), x.get('time', '')))
    
    # Format activities by day
    days = {}
    for activity in itinerary_activities:
        day_num = activity.get('day')
        if day_num not in days:
            days[day_num] = {
                'day': day_num,
                'activities': []
            }
        
        days[day_num]['activities'].append({
            'time': activity.get('time', ''),
            'title': activity.get('title', ''),
            'location': activity.get('location', ''),
            'description': activity.get('description', ''),
            'image': activity.get('image'),
            'category': activity.get('category', '')
        })
    
    # Convert to list and sort by day
    formatted_days = list(days.values())
    formatted_days.sort(key=lambda x: x['day'])
    
    return jsonify({
        'details': {**itinerary, 'id': itinerary_id},
        'days': formatted_days
    }), 200

@app.route('/api/itineraries', methods=['POST'])
@token_required
def create_itinerary(current_user):
    data = request.json
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Extract itinerary data and days
    itinerary_data = {k: v for k, v in data.items() if k != 'days'}
    days = data.get('days', [])
    
    user_id = current_user.get('id')
    
    # Create itinerary
    itinerary_id = generate_uuid()
    created_at = datetime.utcnow().isoformat()
    
    itinerary = {
        'user_id': user_id,
        'title': itinerary_data.get('title', ''),
        'days': itinerary_data.get('days', 0),
        'start_date': itinerary_data.get('start_date'),
        'pace': itinerary_data.get('pace'),
        'budget': itinerary_data.get('budget'),
        'interests': itinerary_data.get('interests'),
        'transportation': itinerary_data.get('transportation'),
        'include_food': itinerary_data.get('include_food'),
        'created_at': created_at,
        'updated_at': created_at
    }
    
    itineraries_db[itinerary_id] = itinerary
    
    # Create activities
    for day in days:
        day_num = day.get('day')
        for activity in day.get('activities', []):
            activity_id = generate_uuid()
            activities_db[activity_id] = {
                'itinerary_id': itinerary_id,
                'day': day_num,
                'time': activity.get('time', ''),
                'title': activity.get('title', ''),
                'location': activity.get('location', ''),
                'description': activity.get('description', ''),
                'image': activity.get('image'),
                'category': activity.get('category', '')
            }
    
    return jsonify({**itinerary, 'id': itinerary_id}), 201

@app.route('/api/itineraries/<itinerary_id>', methods=['PUT'])
@token_required
def update_itinerary(current_user, itinerary_id):
    data = request.json
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    user_id = current_user.get('id')
    
    # Check if itinerary exists and belongs to user
    itinerary = itineraries_db.get(itinerary_id)
    if not itinerary or itinerary.get('user_id') != user_id:
        return jsonify({'message': 'Itinerary not found'}), 404
    
    # Extract itinerary data and days
    itinerary_data = {k: v for k, v in data.items() if k != 'days'}
    days = data.get('days', [])
    
    # Update itinerary
    updated_at = datetime.utcnow().isoformat()
    itineraries_db[itinerary_id] = {
        'user_id': user_id,
        'title': itinerary_data.get('title', ''),
        'days': itinerary_data.get('days', 0),
        'start_date': itinerary_data.get('start_date'),
        'pace': itinerary_data.get('pace'),
        'budget': itinerary_data.get('budget'),
        'interests': itinerary_data.get('interests'),
        'transportation': itinerary_data.get('transportation'),
        'include_food': itinerary_data.get('include_food'),
        'created_at': itinerary.get('created_at'),
        'updated_at': updated_at
    }
    
    # Delete existing activities
    activities_to_delete = []
    for activity_id, activity in activities_db.items():
        if activity.get('itinerary_id') == itinerary_id:
            activities_to_delete.append(activity_id)
    
    for activity_id in activities_to_delete:
        del activities_db[activity_id]
    
    # Create new activities
    for day in days:
        day_num = day.get('day')
        for activity in day.get('activities', []):
            activity_id = generate_uuid()
            activities_db[activity_id] = {
                'itinerary_id': itinerary_id,
                'day': day_num,
                'time': activity.get('time', ''),
                'title': activity.get('title', ''),
                'location': activity.get('location', ''),
                'description': activity.get('description', ''),
                'image': activity.get('image'),
                'category': activity.get('category', '')
            }
    
    return jsonify({**itineraries_db[itinerary_id], 'id': itinerary_id}), 200

@app.route('/api/itineraries/<itinerary_id>', methods=['DELETE'])
@token_required
def delete_itinerary(current_user, itinerary_id):
    user_id = current_user.get('id')
    
    # Check if itinerary exists and belongs to user
    itinerary = itineraries_db.get(itinerary_id)
    if not itinerary or itinerary.get('user_id') != user_id:
        return jsonify({'message': 'Itinerary not found'}), 404
    
    # Delete activities
    activities_to_delete = []
    for activity_id, activity in activities_db.items():
        if activity.get('itinerary_id') == itinerary_id:
            activities_to_delete.append(activity_id)
    
    for activity_id in activities_to_delete:
        del activities_db[activity_id]
    
    # Delete itinerary
    del itineraries_db[itinerary_id]
    
    return '', 204

# Profile routes
@app.route('/api/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    user_id = current_user.get('id')
    user_metadata = current_user.get('user_metadata', {})
    
    return jsonify({
        'id': user_id,
        'email': current_user.get('email'),
        'name': user_metadata.get('name'),
        'created_at': current_user.get('created_at'),
        'location': user_metadata.get('location'),
        'bio': user_metadata.get('bio'),
        'avatar_url': user_metadata.get('avatar_url')
    }), 200

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    data = request.json
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    user_id = current_user.get('id')
    user_metadata = current_user.get('user_metadata', {}).copy()
    
    # Update metadata
    if 'name' in data and data['name'] is not None:
        user_metadata['name'] = sanitize_input(data['name'])
    
    if 'location' in data and data['location'] is not None:
        user_metadata['location'] = sanitize_input(data['location'])
    
    if 'bio' in data and data['bio'] is not None:
        user_metadata['bio'] = sanitize_input(data['bio'])
    
    if 'avatar_url' in data and data['avatar_url'] is not None:
        user_metadata['avatar_url'] = data['avatar_url']
    
    # Update user
    users_db[user_id]['user_metadata'] = user_metadata
    
    return jsonify({
        'id': user_id,
        'email': current_user.get('email'),
        'name': user_metadata.get('name'),
        'created_at': current_user.get('created_at'),
        'location': user_metadata.get('location'),
        'bio': user_metadata.get('bio'),
        'avatar_url': user_metadata.get('avatar_url')
    }), 200

@app.route('/api/profile/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    user_id = current_user.get('id')
    
    # Count itineraries
    itineraries_count = 0
    itinerary_ids = []
    for itinerary_id, itinerary in itineraries_db.items():
        if itinerary.get('user_id') == user_id:
            itineraries_count += 1
            itinerary_ids.append(itinerary_id)
    
    # Count activities
    activities_count = 0
    for activity in activities_db.values():
        if activity.get('itinerary_id') in itinerary_ids:
            activities_count += 1
    
    # Calculate hours explored
    hours_explored = round(activities_count * 1.5)
    
    # Mock forum posts count
    forum_posts_count = 8
    
    return jsonify({
        'saved_itineraries': itineraries_count,
        'forum_posts': forum_posts_count,
        'hours_explored': hours_explored
    }), 200

# Places routes
@app.route('/api/places', methods=['GET'])
def get_places():
    places = load_json_data('places.json')
    
    if not places:
        return jsonify({'message': 'Places data not found'}), 500
    
    return jsonify(places), 200

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    restaurants = load_json_data('restaurants.json')
    
    if not restaurants:
        return jsonify({'message': 'Restaurants data not found'}), 500
    
    return jsonify(restaurants), 200

@app.route('/api/places/nearby', methods=['GET'])
def get_nearby_places():
    lat = float(request.args.get('lat', 0))
    lng = float(request.args.get('lng', 0))
    radius = int(request.args.get('radius', 5000))
    
    places = load_json_data('places.json')
    
    if not places:
        return jsonify({'message': 'Places data not found'}), 500
    
    # Simulate distance calculation
    import random
    for place in places:
        place['distance'] = random.randint(100, radius)
    
    # Filter places within radius
    nearby = [p for p in places if p.get('distance', 0) <= radius]
    
    return jsonify(nearby), 200

@app.route('/api/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    template = load_json_data('itinerary_template.json')
    
    if not template:
        return jsonify({'message': 'Itinerary template not found'}), 500
    
    days = data.get('days', 3)
    pace = data.get('pace', 'moderate')
    interests = data.get('interests', [])
    
    result = []
    
    # Generate itinerary
    for day in range(1, days + 1):
        # Adjust activities based on pace
        activities_per_day = 3  # Default for moderate pace
        if pace == 'relaxed':
            activities_per_day = 2
        elif pace == 'intensive':
            activities_per_day = 4
        
        day_activities = template.get('activities', [])[:activities_per_day]
        
        day_data = {
            'day': day,
            'activities': day_activities
        }
        result.append(day_data)
    
    return jsonify(result), 200

@app.route('/api/places/search', methods=['GET'])
def search_places():
    query = request.args.get('query', '').lower()
    category = request.args.get('category')
    
    places = load_json_data('places.json')
    
    if not places:
        return jsonify({'message': 'Places data not found'}), 500
    
    results = []
    
    for place in places:
        name = place.get('name', '').lower()
        description = place.get('description', '').lower()
        place_category = place.get('category', '').lower()
        
        if query in name or query in description:
            if category is None or (category and category.lower() == place_category):
                results.append(place)
    
    return jsonify(results), 200

# Weather routes
@app.route('/api/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city', '')
    
    if not city:
        return jsonify({'message': 'City parameter is required'}), 400
    
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={WEATHER_API_KEY}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'message': f'Failed to fetch weather data: {str(e)}'}), 500

@app.route('/api/weather/forecast', methods=['GET'])
def get_weather_forecast():
    city = request.args.get('city', '')
    days = int(request.args.get('days', 5))
    
    if not city:
        return jsonify({'message': 'City parameter is required'}), 400
    
    if days < 1 or days > 7:
        return jsonify({'message': 'Days parameter must be between 1 and 7'}), 400
    
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&units=metric&appid={WEATHER_API_KEY}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Process forecast data
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
        
        # Calculate average humidity and format result
        result = []
        for date, forecast in sorted(daily_forecasts.items()):
            if forecast['humidity']:
                forecast['humidity'] = sum(forecast['humidity']) // len(forecast['humidity'])
            result.append(forecast)
        
        return jsonify(result), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'message': f'Failed to fetch weather forecast: {str(e)}'}), 500

@app.route('/api/weather/recommendation', methods=['GET'])
def get_weather_recommendation():
    city = request.args.get('city', '')
    
    if not city:
        return jsonify({'message': 'City parameter is required'}), 400
    
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&units=metric&appid={WEATHER_API_KEY}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        weather_data = response.json()
        
        # Extract weather info
        temp = weather_data['main']['temp']
        weather_id = weather_data['weather'][0]['id']
        weather_main = weather_data['weather'][0]['main']
        
        # Generate recommendations
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
        
        return jsonify(recommendations), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'message': f'Failed to generate weather recommendation: {str(e)}'}), 500

# Serve static files for production build
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Ensure JSON data files exist
data_files = ['places.json', 'restaurants.json', 'itinerary_template.json']
for file in data_files:
    file_path = f"data/{file}"
    if not os.path.exists(file_path):
        with open(file_path, 'w', encoding='utf-8') as f:
            if file == 'places.json':
                json.dump([
                    {
                        "id": "p1",
                        "name": "Vashi Central Park",
                        "description": "Beautiful park in the heart of Vashi",
                        "image": "/images/places/vashi-park.jpg",
                        "rating": 4.5,
                        "category": "park"
                    }
                ], f, indent=2)
            elif file == 'restaurants.json':
                json.dump([
                    {
                        "id": "r1",
                        "name": "Coastal Cuisine",
                        "description": "Authentic seafood restaurant",
                        "image": "/images/restaurants/coastal.jpg",
                        "rating": 4.2,
                        "category": "seafood"
                    }
                ], f, indent=2)
            elif file == 'itinerary_template.json':
                json.dump({
                    "activities": [
                        {
                            "time": "09:00 AM",
                            "title": "Morning Walk",
                            "location": "Vashi Central Park",
                            "description": "Start your day with a refreshing walk",
                            "image": "/images/activities/morning-walk.jpg",
                            "category": "outdoor"
                        },
                        {
                            "time": "12:00 PM",
                            "title": "Lunch Break",
                            "location": "Coastal Cuisine",
                            "description": "Enjoy seafood for lunch",
                            "image": "/images/activities/lunch.jpg",
                            "category": "food"
                        },
                        {
                            "time": "03:00 PM",
                            "title": "Shopping",
                            "location": "Inorbit Mall",
                            "description": "Explore the mall",
                            "image": "/images/activities/shopping.jpg",
                            "category": "shopping"
                        },
                        {
                            "time": "07:00 PM",
                            "title": "Dinner",
                            "location": "Raghuleela Mall",
                            "description": "Dinner at food court",
                            "image": "/images/activities/dinner.jpg",
                            "category": "food"
                        }
                    ]
                }, f, indent=2)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
