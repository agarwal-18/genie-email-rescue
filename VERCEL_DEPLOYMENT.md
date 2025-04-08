
# Vercel Deployment Instructions

To ensure proper deployment on Vercel, the following environment variables should be set in the Vercel project settings:

## Required Environment Variables

- `FLASK_ENV`: Set to `production`
- `JWT_SECRET_KEY`: A secure random string for JWT token generation
- `WEATHER_API_KEY`: Your OpenWeatherMap API key (default: 562c360f0d7884a7ec779f34559a11fb)
- `SUPABASE_URL`: Your Supabase URL (default: https://jsoyxzwtacwkyvbclnqa.supabase.co)
- `SUPABASE_KEY`: Your Supabase Key

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure the following Build & Development Settings:
   - Framework Preset: Other
   - Build Command: `chmod +x ./build.sh && ./build.sh`
   - Output Directory: `dist`
   - Install Command: `pip install -r requirements.txt && npm ci`

3. Add the environment variables listed above
4. Deploy the project

## Local Development

For local development:
1. Run `npm install` to install frontend dependencies
2. Run `pip install -r requirements.txt` to install Python dependencies  
3. Run `./run_python.sh` to start both backend and frontend servers
