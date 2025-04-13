
// API Configuration
export const API_CONFIG = {
  // In development, this would point to your local Python server
  // In production, this would be your deployed Python API URL
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://tripgenie-smoky.vercel.app/api' 
    : 'http://localhost:8000/api'
};
