
export const API_CONFIG = {
  // Base URL for API requests
  baseURL: 'https://tisjohgybvntovgogkij.supabase.co',
  
  // Default image for places when everything else fails
  defaultPlaceImage: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=800',
  
  // Number of retries for image loading
  imageLoadRetries: 3,
  
  // App version
  version: '1.0.2',
  
  // Default title for the app
  appTitle: 'Navi Mumbai Explorer',
  
  // Authentication redirect settings
  auth: {
    // Redirect URL for authentication (should match Supabase settings)
    redirectUrl: window.location.origin,
    // Fallback redirect path after successful login
    defaultRedirectPath: '/'
  },
  
  // Image settings
  images: {
    // Default quality for compressed images
    quality: 80,
    // Default width for thumbnails
    thumbWidth: 800
  }
};
