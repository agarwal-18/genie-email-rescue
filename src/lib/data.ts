
interface ItineraryOptions {
  days: number;
  pace: string;
  budget: string;
  interests: string[];
  includeFood: boolean;
  transportation: string;
  location?: string; // Add location as an optional parameter
}
