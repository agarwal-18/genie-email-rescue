
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  defaultMapCenter: [73.0401, 19.0185], // Default center coordinates for Navi Mumbai
  defaultMapZoom: 12, // Default zoom level for the map
  validRoutes: ["/", "/login", "/register", "/verify-email", "/places", "/itinerary", "/saved-itineraries", "/forum", "/forum/create", "/forum/post/:postId", "/profile"]
};

export interface ItinerarySettings {
  title: string;
  days: number;
  start_date?: Date | string;
  pace: string;
  budget: string;
  interests: string[];
  transportation: string;
  include_food: boolean;
  locations?: string[];
  user_id?: string;
}

// These are just type aliases that refer to the global types
export type ItineraryActivityBase = ItineraryActivity;
export type ItineraryDayBase = ItineraryDay;
