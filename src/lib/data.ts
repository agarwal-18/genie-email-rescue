
interface ItineraryOptions {
  days: number;
  pace: string;
  budget: string;
  interests: string[];
  includeFood: boolean;
  transportation: string;
  location?: string; // Keeping for backwards compatibility
  locations?: string[]; // Multiple locations parameter
  regions?: string[]; // Multiple regions parameter
}

// Define the Place interface to ensure consistent data structure
interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  location: string;
  region?: string;
  duration?: string;
  featured?: boolean;
  price?: string;
}

// Define restaurant interface
interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  rating: number;
  location: string;
  region?: string;
  price: string;
}

// Import places data from the backend JSON file
import placesJson from '../../backend/data/places.json';
import restaurantsJson from '../../backend/data/restaurants.json';

// Use the imported places data
const places: Place[] = placesJson.places;
const restaurants: Restaurant[] = restaurantsJson.restaurants;

// Export function to get all places
export function getAllPlaces(): Place[] {
  return places;
}

// Export function to get all restaurants
export function getAllRestaurants(): Restaurant[] {
  return restaurants;
}

// Get all regions function
export function getAllRegions(): string[] {
  const regions = new Set<string>();
  places.forEach(place => {
    if (place.region) {
      regions.add(place.region);
    }
  });
  return Array.from(regions);
}

// Function to get places by location (used for itinerary generation)
export function getPlacesByLocation(locationName: string): Place[] {
  return places.filter(place => place.location === locationName);
}

// Function to get places by multiple locations
export function getPlacesByLocations(locationNames: string[]): Place[] {
  return places.filter(place => locationNames.includes(place.location));
}

// Function to get places by region
export function getPlacesByRegion(regionName: string): Place[] {
  return places.filter(place => place.region === regionName);
}

// Function to get places by multiple regions
export function getPlacesByRegions(regionNames: string[]): Place[] {
  return places.filter(place => place.region && regionNames.includes(place.region));
}

// Function to get restaurants by location (used for itinerary generation)
export function getRestaurantsByLocation(locationName: string): Restaurant[] {
  return restaurants.filter(restaurant => restaurant.location === locationName);
}

// Function to get restaurants by multiple locations
export function getRestaurantsByLocations(locationNames: string[]): Restaurant[] {
  return restaurants.filter(restaurant => locationNames.includes(restaurant.location));
}

// Function to get restaurants by region
export function getRestaurantsByRegion(regionName: string): Restaurant[] {
  return restaurants.filter(restaurant => restaurant.region === regionName);
}

// Function to get restaurants by multiple regions
export function getRestaurantsByRegions(regionNames: string[]): Restaurant[] {
  return restaurants.filter(restaurant => restaurant.region && regionNames.includes(restaurant.region));
}

// Export function to generate an itinerary based on provided options
export function generateItinerary(options: ItineraryOptions) {
  const { days, pace, budget, interests, includeFood, transportation } = options;
  
  // Handle both single location and multiple locations
  const locationsList = options.locations || (options.location ? [options.location] : []);
  const regionsList = options.regions || [];
  
  console.log("Generating itinerary with options:", options);
  console.log("Locations:", locationsList);
  console.log("Regions:", regionsList);
  
  // Array to store our itinerary
  const itinerary = [];
  
  // Get places filtered by the selected locations and regions
  let eligiblePlaces: Place[] = [];
  
  if (regionsList.length > 0) {
    // If regions are specified, prioritize by region
    eligiblePlaces = getPlacesByRegions(regionsList);
    console.log(`Found ${eligiblePlaces.length} places in the specified regions`);
    
    // If we still need more places, add places from the specified locations
    if (locationsList.length > 0 && eligiblePlaces.length < days * 3) {
      const locationPlaces = getPlacesByLocations(locationsList);
      console.log(`Found ${locationPlaces.length} additional places in the specified locations`);
      
      // Add location places that aren't already included
      locationPlaces.forEach(place => {
        if (!eligiblePlaces.some(p => p.id === place.id)) {
          eligiblePlaces.push(place);
        }
      });
    }
  } else if (locationsList.length > 0) {
    // If only locations are specified, use those
    eligiblePlaces = getPlacesByLocations(locationsList);
    console.log(`Found ${eligiblePlaces.length} places in the specified locations`);
  } else {
    // If neither regions nor locations are specified, use all places
    eligiblePlaces = places;
    console.log(`Using all ${eligiblePlaces.length} places`);
  }
  
  // Get restaurants filtered by the selected locations and regions
  let eligibleRestaurants: Restaurant[] = [];
  
  if (regionsList.length > 0) {
    // If regions are specified, prioritize by region
    eligibleRestaurants = getRestaurantsByRegions(regionsList);
    
    // If we still need more restaurants, add restaurants from the specified locations
    if (locationsList.length > 0 && eligibleRestaurants.length < days * 2) {
      const locationRestaurants = getRestaurantsByLocations(locationsList);
      
      // Add location restaurants that aren't already included
      locationRestaurants.forEach(restaurant => {
        if (!eligibleRestaurants.some(r => r.id === restaurant.id)) {
          eligibleRestaurants.push(restaurant);
        }
      });
    }
  } else if (locationsList.length > 0) {
    // If only locations are specified, use those
    eligibleRestaurants = getRestaurantsByLocations(locationsList);
  } else {
    // If neither regions nor locations are specified, use all restaurants
    eligibleRestaurants = restaurants;
  }
  
  // If we don't have enough places for the selected locations/regions, add some from nearby areas
  if (eligiblePlaces.length < days * 3) {
    console.log(`Not enough places in the selected regions/locations, adding some from other areas`);
    // Get places from other areas, sorted by rating
    const otherPlaces = places
      .filter(place => !eligiblePlaces.some(p => p.id === place.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, days * 3 - eligiblePlaces.length);
      
    eligiblePlaces = [...eligiblePlaces, ...otherPlaces];
  }
  
  // Filter places by interests if provided
  let filteredPlaces = eligiblePlaces;
  if (interests && interests.length > 0) {
    console.log(`Filtering places by interests: ${interests.join(', ')}`);
    // This is a simple filter that checks if any interest matches the place category
    filteredPlaces = filteredPlaces.filter(place => 
      interests.some(interest => 
        place.category.toLowerCase().includes(interest.toLowerCase()) || 
        place.description.toLowerCase().includes(interest.toLowerCase())
      )
    );
    
    // If we filtered too aggressively and don't have enough places, add some back
    if (filteredPlaces.length < days * 2) {
      console.log("Not enough places after interest filtering, adding back popular places");
      // Add some popular places back regardless of interest
      const popularPlaces = eligiblePlaces
        .filter(place => place.rating >= 4.3)
        .filter(place => !filteredPlaces.some(fp => fp.id === place.id));
      
      filteredPlaces = [...filteredPlaces, ...popularPlaces.slice(0, days * 2 - filteredPlaces.length)];
    }
  }
  
  // Sort places by rating (descending) to prioritize better-rated places
  filteredPlaces.sort((a, b) => b.rating - a.rating);
  console.log(`Final filtered places count: ${filteredPlaces.length}`);
  
  // Filter restaurants by budget if food is included
  let filteredRestaurants = eligibleRestaurants;
  if (includeFood && budget) {
    // Match budget string to price categories
    let priceCategories = [];
    if (budget.toLowerCase().includes('budget')) {
      priceCategories.push('Budget-Friendly');
    }
    if (budget.toLowerCase().includes('mid')) {
      priceCategories.push('Mid-Range');
    }
    if (budget.toLowerCase().includes('luxury')) {
      priceCategories.push('Luxury');
    }
    
    if (priceCategories.length > 0) {
      filteredRestaurants = filteredRestaurants.filter(restaurant => 
        priceCategories.includes(restaurant.price)
      );
    }
    
    // If we don't have enough restaurants after filtering, add some back
    if (filteredRestaurants.length < days * 2) {
      filteredRestaurants = eligibleRestaurants;
    }
    
    // Sort restaurants by rating
    filteredRestaurants.sort((a, b) => b.rating - a.rating);
  }
  
  // Determine how many activities per day based on pace
  let activitiesPerDay = 3; // Default for moderate pace
  if (pace.toLowerCase().includes('relaxed')) {
    activitiesPerDay = 2;
  } else if (pace.toLowerCase().includes('fast') || pace.toLowerCase().includes('intensive')) {
    activitiesPerDay = 4;
  }
  
  console.log(`Planning ${activitiesPerDay} activities per day`);
  
  // Create a copy of places to work with so we don't modify the originals
  const placesToUse = [...filteredPlaces];
  const restaurantsToUse = [...filteredRestaurants];

  // Generate the itinerary for each day
  for (let day = 1; day <= days; day++) {
    console.log(`Generating itinerary for day ${day}`);
    const dayActivities = [];
    
    // Morning activity (8:00 AM - 11:00 AM)
    if (placesToUse.length > 0) {
      const morningPlace = placesToUse.shift();
      if (morningPlace) {
        console.log(`Morning activity: ${morningPlace.name}`);
        dayActivities.push({
          time: "8:00 AM",
          title: morningPlace.name,
          location: morningPlace.location,
          description: morningPlace.description,
          image: morningPlace.image,
          category: morningPlace.category
        });
      }
    }
    
    // Lunch (if includeFood is true)
    if (includeFood && restaurantsToUse.length > 0) {
      const lunchPlace = restaurantsToUse.shift();
      if (lunchPlace) {
        console.log(`Lunch at: ${lunchPlace.name}`);
        dayActivities.push({
          time: "12:00 PM",
          title: `Lunch at ${lunchPlace.name}`,
          location: lunchPlace.location,
          description: lunchPlace.description,
          image: lunchPlace.image,
          category: "Food"
        });
      }
    }
    
    // Afternoon activity (2:00 PM - 5:00 PM)
    if (placesToUse.length > 0) {
      const afternoonPlace = placesToUse.shift();
      if (afternoonPlace) {
        console.log(`Afternoon activity: ${afternoonPlace.name}`);
        dayActivities.push({
          time: "2:00 PM",
          title: afternoonPlace.name,
          location: afternoonPlace.location,
          description: afternoonPlace.description,
          image: afternoonPlace.image,
          category: afternoonPlace.category
        });
      }
    }
    
    // Evening activity or dinner
    if (activitiesPerDay > 3 && placesToUse.length > 0) {
      const eveningPlace = placesToUse.shift();
      if (eveningPlace) {
        console.log(`Evening activity: ${eveningPlace.name}`);
        dayActivities.push({
          time: "5:00 PM",
          title: eveningPlace.name,
          location: eveningPlace.location,
          description: eveningPlace.description,
          image: eveningPlace.image,
          category: eveningPlace.category
        });
      }
    }
    
    // Dinner (if includeFood is true)
    if (includeFood && restaurantsToUse.length > 0) {
      const dinnerPlace = restaurantsToUse.shift();
      if (dinnerPlace) {
        console.log(`Dinner at: ${dinnerPlace.name}`);
        dayActivities.push({
          time: "7:00 PM",
          title: `Dinner at ${dinnerPlace.name}`,
          location: dinnerPlace.location,
          description: dinnerPlace.description,
          image: dinnerPlace.image,
          category: "Food"
        });
      }
    }
    
    // Add the day's itinerary to the overall itinerary
    itinerary.push({
      day,
      activities: dayActivities
    });
    
    // If we're running low on places, refill our array
    if (placesToUse.length < 2) {
      console.log("Running low on places, refilling array");
      // Avoid using places we've already used in this itinerary
      const usedPlaceIds = new Set(dayActivities
        .filter(a => a.category !== "Food") // Filter out restaurants
        .map(a => {
          // Find the original place to get its ID
          const originalPlace = filteredPlaces.find(p => p.name === a.title);
          return originalPlace ? originalPlace.id : null;
        })
        .filter(id => id !== null)); // Filter out nulls
      
      // Add more places that haven't been used in this itinerary
      const morePlaces = filteredPlaces
        .filter(place => !usedPlaceIds.has(place.id))
        .sort(() => Math.random() - 0.5); // Shuffle
      
      placesToUse.push(...morePlaces);
    }
    
    // Same for restaurants
    if (restaurantsToUse.length < 2) {
      console.log("Running low on restaurants, refilling array");
      restaurantsToUse.push(...filteredRestaurants.sort(() => Math.random() - 0.5));
    }
  }
  
  console.log("Itinerary generation complete:", itinerary);
  return itinerary;
}
