
// API Configuration
export const API_CONFIG = {
  // In development, this points to local Python server
  // In production, this will use the deployed API URL
  baseURL: import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_API_URL || 'https://navi-trip-planner.vercel.app/api'
    : 'http://localhost:8000/api'
};

