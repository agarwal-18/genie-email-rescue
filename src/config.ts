export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
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
