
// API Configuration
export const API_CONFIG = {
  // In development, this points to local Python server
  // In production, this will use the deployed API URL
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://navi-trip-planner.vercel.app/api'  // Replace with your Vercel domain
    : 'http://localhost:8000/api'
};
