interface ItineraryOptions {
  days: number;
  pace: string;
  budget: string;
  interests: string[];
  includeFood: boolean;
  transportation: string;
  location?: string; // Keeping for backwards compatibility
  locations?: string[]; // New multiple locations parameter
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
  price: string;
}

// Navi Mumbai places data
const places: Place[] = [
  {
    id: "1",
    name: "DY Patil Stadium",
    category: "Sports",
    description: "A state-of-the-art cricket stadium that hosts IPL matches and other sporting events.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.6,
    location: "Nerul",
    duration: "3-4 hours",
    featured: true
  },
  {
    id: "2",
    name: "Central Park",
    category: "Parks & Gardens",
    description: "A large urban park with walking paths, gardens, and recreational facilities.",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Kharghar",
    duration: "1-2 hours"
  },
  {
    id: "3",
    name: "Wonders Park",
    category: "Amusement",
    description: "A theme park with miniature replicas of world-famous monuments and attractions.",
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.4,
    location: "Nerul",
    duration: "2-3 hours"
  },
  {
    id: "4",
    name: "NMMC Butterfly Garden",
    category: "Parks & Gardens",
    description: "A specialized garden that attracts various butterfly species with plants that serve as food sources.",
    image: "https://images.unsplash.com/photo-1606748313289-81f81f9eae50?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.2,
    location: "Seawoods",
    duration: "1 hour"
  },
  {
    id: "5",
    name: "Pandavkada Falls",
    category: "Natural Attractions",
    description: "A scenic waterfall that comes alive during the monsoon season, offering beautiful views.",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Kharghar",
    duration: "2-3 hours"
  },
  {
    id: "6",
    name: "Inorbit Mall",
    category: "Shopping",
    description: "A premium shopping destination with international brands, restaurants, and entertainment options.",
    image: "https://images.unsplash.com/photo-1519567241313-8636f525cd4a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.4,
    location: "Vashi",
    duration: "3-4 hours",
    featured: true
  },
  {
    id: "7",
    name: "Parsik Hill",
    category: "Natural Attractions",
    description: "A hill offering panoramic views of Navi Mumbai, popular for trekking and sunrise viewing.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.1,
    location: "Belapur",
    duration: "2-3 hours"
  },
  {
    id: "8",
    name: "Belapur Fort",
    category: "Historical Sites",
    description: "Historical fort built in the 17th century, offering a glimpse into the region's past.",
    image: "https://images.unsplash.com/photo-1564566500014-459a2967f00c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.0,
    location: "Belapur",
    duration: "1-2 hours"
  },
  {
    id: "9",
    name: "Nerul Balaji Temple",
    category: "Religious Sites",
    description: "A beautiful temple dedicated to Lord Balaji, featuring South Indian architecture.",
    image: "https://images.unsplash.com/photo-1561361058-c12e14fc165e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.7,
    location: "Nerul",
    duration: "1 hour",
    featured: true
  },
  {
    id: "10",
    name: "Seawoods Grand Central Mall",
    category: "Shopping",
    description: "A modern mall with a mix of retail shops, eateries, and entertainment options.",
    image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Seawoods",
    duration: "2-3 hours"
  },
  {
    id: "11",
    name: "Kharghar Hills",
    category: "Natural Attractions",
    description: "Rolling hills offering scenic views, popular for trekking and nature photography.",
    image: "https://images.unsplash.com/photo-1525477759567-7c3cd50a8957?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Kharghar",
    duration: "3-4 hours"
  },
  {
    id: "12",
    name: "Utsav Chowk",
    category: "Entertainment",
    description: "A popular hangout spot with food stalls, cultural performances, and community gatherings.",
    image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.2,
    location: "Kharghar",
    duration: "1-2 hours"
  },
  {
    id: "13",
    name: "CIDCO Exhibition Centre",
    category: "Cultural",
    description: "A venue hosting exhibitions, trade shows, and cultural events throughout the year.",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.0,
    location: "Vashi",
    duration: "2-3 hours"
  },
  {
    id: "14",
    name: "Mini Seashore",
    category: "Natural Attractions",
    description: "A small waterfront area perfect for evening walks and enjoying cool breezes.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.4,
    location: "Vashi",
    duration: "1 hour"
  },
  {
    id: "15",
    name: "Shilp Gram",
    category: "Cultural",
    description: "A craft village showcasing traditional arts, crafts, and cultural performances.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1415&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.2,
    location: "Airoli",
    duration: "2 hours"
  },
  {
    id: "16",
    name: "Flamingo Sanctuary",
    category: "Wildlife",
    description: "A wetland sanctuary where thousands of flamingos migrate during winter months.",
    image: "https://images.unsplash.com/photo-1564171149171-88ba9136cdc8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.8,
    location: "Airoli",
    duration: "2-3 hours",
    featured: true
  },
  {
    id: "17",
    name: "Dr. Ambedkar Memorial",
    category: "Educational",
    description: "An interactive museum with exhibits and demonstrations for all ages.",
    image: "https://images.unsplash.com/photo-1576086135867-9301855780d5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Airoli",
    duration: "2-3 hours"
  },
  {
    id: "18",
    name: "Vashi Creek Bridge",
    category: "Landmarks",
    description: "An iconic bridge connecting Mumbai to Navi Mumbai, offering scenic views of the creek.",
    image: "https://images.unsplash.com/photo-1559570278-eb8d71d06403?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.1,
    location: "Vashi",
    duration: "30 minutes"
  },
  {
    id: "19",
    name: "Jewel of Navi Mumbai",
    category: "Parks & Gardens",
    description: "A well-maintained garden with beautiful landscapes, fountains, and recreational areas.",
    image: "https://images.unsplash.com/photo-1584479898061-15742e14f50d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Seawoods",
    duration: "1-2 hours"
  },
  {
    id: "20",
    name: "Ulwe Hill",
    category: "Natural Attractions",
    description: "A hill offering panoramic views of the developing Navi Mumbai Airport area.",
    image: "https://images.unsplash.com/photo-1551978129-b73f45d132eb?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.0,
    location: "Ulwe",
    duration: "2 hours"
  },
  {
    id: "21",
    name: "Bonsai Garden",
    category: "Parks & Gardens",
    description: "A specialized garden featuring a collection of bonsai trees and Japanese-inspired landscapes.",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.2,
    location: "Belapur",
    duration: "1 hour"
  },
  {
    id: "22",
    name: "Raghuleela Mall",
    category: "Shopping",
    description: "A popular shopping destination with various retail outlets, food court, and entertainment options.",
    image: "https://images.unsplash.com/photo-1605267994962-015b59d59ea9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.1,
    location: "Vashi",
    duration: "2-3 hours"
  },
  {
    id: "23",
    name: "Golf Course",
    category: "Sports",
    description: "An 18-hole golf course set amidst beautiful landscapes and greenery.",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Kharghar",
    duration: "4-5 hours"
  },
  {
    id: "24",
    name: "Airoli Knowledge Park",
    category: "Educational",
    description: "A tech hub housing various IT companies and educational institutions.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.0,
    location: "Airoli",
    duration: "1-2 hours"
  },
  {
    id: "25",
    name: "Mango Garden",
    category: "Parks & Gardens",
    description: "A garden with various species of mango trees, popular during the summer season.",
    image: "https://images.unsplash.com/photo-1622944925998-2429e7c6ae91?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.2,
    location: "Belapur",
    duration: "1 hour"
  }
];

// Navi Mumbai restaurants data
const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Gajali Restaurant",
    cuisine: "Seafood",
    description: "Famous for its coastal Maharashtrian cuisine and fresh seafood dishes.",
    image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Vashi",
    price: "Mid-Range"
  },
  {
    id: "r2",
    name: "Sigree Global Grill",
    cuisine: "Multi-cuisine",
    description: "Renowned for its buffet spread featuring global cuisines with live grilling stations.",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.4,
    location: "Nerul",
    price: "Luxury"
  },
  {
    id: "r3",
    name: "Urban Tadka",
    cuisine: "North Indian",
    description: "Popular for its authentic North Indian dishes and Punjabi specialties.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Kharghar",
    price: "Mid-Range"
  },
  {
    id: "r4",
    name: "Cafe Trofima",
    cuisine: "Continental",
    description: "A cozy cafe offering European dishes, pastries, and specialty coffees.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.2,
    location: "Seawoods",
    price: "Mid-Range"
  },
  {
    id: "r5",
    name: "China Gate",
    cuisine: "Chinese",
    description: "Authentic Chinese cuisine with Szechuan and Cantonese specialties.",
    image: "https://images.unsplash.com/photo-1550388342-b3fd986e9e66?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.4,
    location: "Belapur",
    price: "Mid-Range"
  },
  {
    id: "r6",
    name: "Dakshin",
    cuisine: "South Indian",
    description: "Specializing in authentic South Indian dishes from various regions.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Vashi",
    price: "Mid-Range"
  },
  {
    id: "r7",
    name: "Saffron Bay",
    cuisine: "Indian",
    description: "Fine dining restaurant offering traditional Indian cuisine with modern presentation.",
    image: "https://images.unsplash.com/photo-1625398407937-2ee245abd2aa?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.6,
    location: "Nerul",
    price: "Luxury"
  },
  {
    id: "r8",
    name: "Bon Appetit",
    cuisine: "Italian",
    description: "Authentic Italian restaurant with handmade pasta and wood-fired pizzas.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Kharghar",
    price: "Luxury"
  },
  {
    id: "r9",
    name: "Street Food Corner",
    cuisine: "Street Food",
    description: "Popular spot offering a variety of Indian street food in a hygienic setting.",
    image: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.2,
    location: "Kopar Khairane",
    price: "Budget-Friendly"
  },
  {
    id: "r10",
    name: "Garden Cafe",
    cuisine: "Multi-cuisine",
    description: "Outdoor cafe set in a garden environment with a diverse menu.",
    image: "https://images.unsplash.com/photo-1599458252573-56ae36120de1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.1,
    location: "Belapur",
    price: "Mid-Range"
  }
];

// Export function to get all places
export function getAllPlaces(): Place[] {
  return places;
}

// Export function to get all restaurants
export function getAllRestaurants(): Restaurant[] {
  return restaurants;
}

// Function to get places by location (used for itinerary generation)
export function getPlacesByLocation(locationName: string): Place[] {
  return places.filter(place => place.location === locationName);
}

// Function to get places by multiple locations
export function getPlacesByLocations(locationNames: string[]): Place[] {
  return places.filter(place => locationNames.includes(place.location));
}

// Function to get restaurants by location (used for itinerary generation)
export function getRestaurantsByLocation(locationName: string): Restaurant[] {
  return restaurants.filter(restaurant => restaurant.location === locationName);
}

// Function to get restaurants by multiple locations
export function getRestaurantsByLocations(locationNames: string[]): Restaurant[] {
  return restaurants.filter(restaurant => locationNames.includes(restaurant.location));
}

// Export function to generate an itinerary based on provided options
export function generateItinerary(options: ItineraryOptions) {
  const { days, pace, budget, interests, includeFood, transportation } = options;
  
  // Handle both single location and multiple locations
  const locationsList = options.locations || (options.location ? [options.location] : []);
  
  // Array to store our itinerary
  const itinerary = [];
  
  // Get places filtered by the selected locations
  let locationPlaces: Place[] = [];
  if (locationsList.length > 0) {
    locationPlaces = getPlacesByLocations(locationsList);
  } else {
    locationPlaces = places;
  }
  
  // Get restaurants filtered by the selected locations
  let locationRestaurants: Restaurant[] = [];
  if (locationsList.length > 0) {
    locationRestaurants = getRestaurantsByLocations(locationsList);
  } else {
    locationRestaurants = restaurants;
  }
  
  // If we don't have enough places for the selected locations, add some from nearby areas
  if (locationPlaces.length < days * 3) {
    console.log(`Not enough places in ${locationsList.join(', ')}, adding some from nearby areas`);
    // This would ideally use a more sophisticated algorithm to add nearby places
  }
  
  // Filter places by interests if provided
  let filteredPlaces = locationPlaces;
  if (interests && interests.length > 0) {
    // This is a simple filter that checks if any interest matches the place category
    filteredPlaces = filteredPlaces.filter(place => 
      interests.some(interest => 
        place.category.toLowerCase().includes(interest.toLowerCase()) || 
        place.description.toLowerCase().includes(interest.toLowerCase())
      )
    );
    
    // If we filtered too aggressively and don't have enough places, add some back
    if (filteredPlaces.length < days * 2) {
      // Add some popular places back regardless of interest
      const popularPlaces = locationPlaces
        .filter(place => place.rating >= 4.3)
        .filter(place => !filteredPlaces.some(fp => fp.id === place.id));
      
      filteredPlaces = [...filteredPlaces, ...popularPlaces.slice(0, days * 2 - filteredPlaces.length)];
    }
  }
  
  // Sort places by rating (descending) to prioritize better-rated places
  filteredPlaces.sort((a, b) => b.rating - a.rating);
  
  // Filter restaurants by budget if food is included
  let filteredRestaurants = locationRestaurants;
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
      filteredRestaurants = locationRestaurants;
    }
    
    // Sort restaurants by rating
    filteredRestaurants.sort((a, b) => b.rating - a.rating);
  }
  
  // Determine how many activities per day based on pace
  let activitiesPerDay = 3; // Default for moderate pace
  if (pace.toLowerCase().includes('relaxed')) {
    activitiesPerDay = 2;
  } else if (pace.toLowerCase().includes('fast')) {
    activitiesPerDay = 4;
  }
  
  // Generate the itinerary for each day
  for (let day = 1; day <= days; day++) {
    const dayActivities = [];
    
    // Morning activity (8:00 AM - 11:00 AM)
    if (filteredPlaces.length > 0) {
      const morningPlace = filteredPlaces.shift();
      dayActivities.push({
        time: "8:00 AM",
        title: morningPlace!.name,
        location: morningPlace!.location,
        description: morningPlace!.description,
        image: morningPlace!.image,
        category: morningPlace!.category
      });
    }
    
    // Lunch (if includeFood is true)
    if (includeFood && filteredRestaurants.length > 0) {
      const lunchPlace = filteredRestaurants.shift();
      dayActivities.push({
        time: "12:00 PM",
        title: `Lunch at ${lunchPlace!.name}`,
        location: lunchPlace!.location,
        description: lunchPlace!.description,
        image: lunchPlace!.image,
        category: "Food"
      });
    }
    
    // Afternoon activity (2:00 PM - 5:00 PM)
    if (filteredPlaces.length > 0) {
      const afternoonPlace = filteredPlaces.shift();
      dayActivities.push({
        time: "2:00 PM",
        title: afternoonPlace!.name,
        location: afternoonPlace!.location,
        description: afternoonPlace!.description,
        image: afternoonPlace!.image,
        category: afternoonPlace!.category
      });
    }
    
    // Evening activity or dinner
    if (activitiesPerDay > 3 && filteredPlaces.length > 0) {
      const eveningPlace = filteredPlaces.shift();
      dayActivities.push({
        time: "5:00 PM",
        title: eveningPlace!.name,
        location: eveningPlace!.location,
        description: eveningPlace!.description,
        image: eveningPlace!.image,
        category: eveningPlace!.category
      });
    }
    
    // Dinner (if includeFood is true)
    if (includeFood && filteredRestaurants.length > 0) {
      const dinnerPlace = filteredRestaurants.shift();
      dayActivities.push({
        time: "7:00 PM",
        title: `Dinner at ${dinnerPlace!.name}`,
        location: dinnerPlace!.location,
        description: dinnerPlace!.description,
        image: dinnerPlace!.image,
        category: "Food"
      });
    }
    
    // Add the day's itinerary to the overall itinerary
    itinerary.push({
      day,
      activities: dayActivities
    });
    
    // If we've used all places, recycle them (this allows for longer trips)
    if (filteredPlaces.length === 0) {
      filteredPlaces = [...locationPlaces];
      // Re-sort and shuffle a bit to avoid exact repetition
      filteredPlaces.sort(() => Math.random() - 0.5);
    }
    
    // Same for restaurants
    if (filteredRestaurants.length === 0) {
      filteredRestaurants = [...locationRestaurants];
      filteredRestaurants.sort(() => Math.random() - 0.5);
    }
  }
  
  return itinerary;
}
