
declare global {
  interface User {
    id: string;
    email: string;
    created_at: string;
    name?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
      location?: string;
      bio?: string;
      [key: string]: any;
    };
  }

  interface Session {
    access_token: string;
    expires_at: number;
    user: User;
  }

  // Define consistent itinerary types globally
  interface ItineraryActivity {
    title: string;
    location: string;
    description?: string; // Make description optional to match ItineraryActivityBase
    time: string;
    image: string;
    category: string;
    day?: number;
    itinerary_id?: string;
  }

  interface ItineraryDay {
    day: number;
    activities: ItineraryActivity[];
  }
}

export {};
