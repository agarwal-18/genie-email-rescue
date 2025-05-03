
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  defaultMapCenter: [73.0401, 19.0185], // Default center coordinates for Navi Mumbai
  defaultMapZoom: 12, // Default zoom level for the map
  validRoutes: ["/", "/login", "/register", "/verify-email", "/places", "/itinerary", "/saved-itineraries", "/forum", "/forum/create", "/forum/post", "/profile"]
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

export interface ItineraryActivityBase {
  title: string;
  location: string;
  description?: string;
  time: string;
  image: string;
  category: string;
}

export interface ItineraryDayBase {
  day: number;
  activities: ItineraryActivityBase[];
}

