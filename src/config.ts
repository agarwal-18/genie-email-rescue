
export const API_CONFIG = {
  // Legacy configuration kept for backward compatibility
  baseURL: 'https://tisjohgybvntovgogkij.supabase.co',
  // Default image for places when everything else fails
  defaultPlaceImage: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=800',
  // Number of retries for image loading
  imageLoadRetries: 2,
  // Default map center coordinates for Navi Mumbai
  defaultMapCenter: [73.0169, 19.0330],
  // Default map zoom level
  defaultMapZoom: 12,
  // Map loading timeout in milliseconds
  mapLoadingTimeout: 2000,
  // Valid routes for auto-retry on 404
  validRoutes: [
    'places', 
    'forum', 
    'itinerary', 
    'planner',
    'saved-itineraries', 
    'login', 
    'register', 
    'profile',
    'verify-email'
  ]
};

// Type definitions for Itinerary types to ensure consistency across the app
export interface ItinerarySettings {
  title: string;
  days: number;
  start_date?: Date | string | null;
  pace?: string | null;
  budget?: string | null;
  interests?: string[] | null;
  transportation?: string | null;
  include_food?: boolean | null;
  user_id?: string;
}

export interface ItineraryActivityBase {
  time: string;
  title: string;
  location: string;
  description: string | null;
  image: string | null;
  category: string | null;
}

export interface ItineraryDayBase {
  day: number;
  activities: ItineraryActivityBase[];
}
