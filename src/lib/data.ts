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

// Maharashtra places data
const places: Place[] = [
  {
    id: "1",
    name: "DY Patil Stadium",
    category: "Sports",
    description: "A state-of-the-art cricket stadium that hosts IPL matches and other sporting events.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.6,
    location: "Nerul",
    region: "Navi Mumbai",
    duration: "3-4 hours",
    featured: true
  },
  {
    id: "2",
    name: "Central Park",
    category: "Parks & Gardens",
    description: "A large urban park with walking paths, gardens, and recreational facilities.",
    image: "https://d3mbwbgtcl4x70.cloudfront.net/Central_Park_Kharghar_774b4a891e.webp",
    rating: 4.3,
    location: "Kharghar",
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
    duration: "2-3 hours"
  },
  {
    id: "4",
    name: "NMMC Butterfly Garden",
    category: "Parks & Gardens",
    description: "A specialized garden that attracts various butterfly species with plants that serve as food sources.",
    image: "https://images.hindustantimes.com/rf/image_size_960x540/HT/p2/2018/09/29/Pictures/thane-india-visit-thane-2018-collector-impact_38ad43b0-c3e6-11e8-9e8c-b17643e39fb5.jpg",
    rating: 4.2,
    location: "Seawoods",
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
    duration: "2-3 hours"
  },
  {
    id: "6",
    name: "Gateway of India",
    category: "Historical Sites",
    description: "The iconic arch monument built during the British Raj, situated on the waterfront of Mumbai harbor.",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.8,
    location: "Colaba",
    region: "Mumbai",
    duration: "1-2 hours",
    featured: true
  },
  {
    id: "7",
    name: "Marine Drive",
    category: "Landmarks",
    description: "A 3.6-kilometer-long boulevard that curves along the coastline of Mumbai's Back Bay, also known as the Queen's Necklace.",
    image: "https://images.unsplash.com/photo-1570269691466-b3bb7973a23c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.7,
    location: "South Mumbai",
    region: "Mumbai",
    duration: "1-2 hours",
    featured: true
  },
  {
    id: "8",
    name: "Ajanta Caves",
    category: "Historical Sites",
    description: "Ancient rock-cut Buddhist cave monuments dating from the 2nd century BCE to about 480 CE, designated UNESCO World Heritage Site.",
    image: "https://images.unsplash.com/photo-1623776025811-fd139155a39b?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.9,
    location: "Aurangabad",
    region: "Aurangabad",
    duration: "4-6 hours",
    featured: true
  },
  {
    id: "9",
    name: "Ellora Caves",
    category: "Historical Sites",
    description: "A UNESCO World Heritage Site featuring Buddhist, Hindu and Jain rock-cut temples and monasteries built between the 6th and 10th century.",
    image: "https://images.unsplash.com/photo-1626015633076-e8578ee16ba9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.8,
    location: "Aurangabad",
    region: "Aurangabad",
    duration: "4-5 hours",
    featured: true
  },
  {
    id: "10",
    name: "Mahabaleshwar",
    category: "Hill Stations",
    description: "A serene hill station with panoramic viewpoints, lush green valleys, and famous strawberry farms.",
    image: "https://images.unsplash.com/photo-1618982469316-5571b3057be5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.6,
    location: "Mahabaleshwar",
    region: "Western Ghats",
    duration: "1-2 days",
    featured: true
  },
  {
    id: "26",
    name: "Lonavala",
    category: "Hill Stations",
    description: "A popular hill station known for its chikki (a traditional sweet), lookout points, and ancient caves.",
    image: "https://images.unsplash.com/photo-1581792254171-cc81f4940827?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Lonavala",
    region: "Western Ghats",
    duration: "1-2 days"
  },
  {
    id: "27",
    name: "Khandala",
    category: "Hill Stations",
    description: "A scenic hill station with beautiful valleys, grasslands, and a pleasant climate throughout the year.",
    image: "https://images.unsplash.com/photo-1606215476392-fb8377e5a4b3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.4,
    location: "Khandala",
    region: "Western Ghats",
    duration: "1 day"
  },
  {
    id: "28",
    name: "Bibi Ka Maqbara",
    category: "Historical Sites",
    description: "Also known as the 'Tomb of the Lady', it's a mausoleum built by Aurangzeb's son in memory of his mother.",
    image: "https://images.unsplash.com/photo-1627548439946-fe25e3bcb736?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Aurangabad",
    region: "Aurangabad",
    duration: "2-3 hours"
  },
  {
    id: "29",
    name: "Shirdi Sai Baba Temple",
    category: "Religious Sites",
    description: "A famous temple dedicated to Sai Baba, a spiritual master revered by both Hindu and Muslim devotees.",
    image: "https://images.unsplash.com/photo-1585146045695-4102009deef9?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.9,
    location: "Shirdi",
    region: "Ahmednagar",
    duration: "3-4 hours",
    featured: true
  },
  {
    id: "30",
    name: "Raigad Fort",
    category: "Historical Sites",
    description: "The historic fort that was the capital of Maratha king Shivaji Maharaj's kingdom, situated atop a hill.",
    image: "https://images.unsplash.com/photo-1608021689097-0123af69cfd0?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.7,
    location: "Mahad",
    region: "Raigad",
    duration: "4-5 hours"
  }
];

// Maharashtra restaurants data
const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Gajali Restaurant",
    cuisine: "Seafood",
    description: "Famous for its coastal Maharashtrian cuisine and fresh seafood dishes.",
    image: "https://images.unsplash.com/photo-1536392706976-e486e2ba97af?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Vashi",
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
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
    region: "Navi Mumbai",
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
    region: "Mumbai",
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
    region: "Navi Mumbai",
    price: "Mid-Range"
  },
  {
    id: "r11",
    name: "Trishna",
    cuisine: "Seafood",
    description: "World-famous restaurant known for butter garlic crab and other seafood delicacies.",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.7,
    location: "Fort",
    region: "Mumbai",
    price: "Luxury"
  },
  {
    id: "r12",
    name: "Leopold Cafe",
    cuisine: "Continental",
    description: "Historic cafe and restaurant known for its colonial charm and global cuisine.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.5,
    location: "Colaba",
    region: "Mumbai",
    price: "Mid-Range"
  },
  {
    id: "r13",
    name: "Punjabi Grill",
    cuisine: "North Indian",
    description: "Authentic North Indian cuisine featuring tandoori specialties and rich curries.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356c36?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4.3,
    location: "Mahabaleshwar",
    region: "Western Ghats",
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
  
  // Array to store our itinerary
  const itinerary = [];
  
  // Get places filtered by the selected locations and regions
  let eligiblePlaces: Place[] = [];
  
  if (regionsList.length > 0) {
    // If regions are specified, prioritize by region
    eligiblePlaces = getPlacesByRegions(regionsList);
    
    // If we still need more places, add places from the specified locations
    if (locationsList.length > 0 && eligiblePlaces.length < days * 3) {
      const locationPlaces = getPlacesByLocations(locationsList);
      
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
  } else {
    // If neither regions nor locations are specified, use all places
    eligiblePlaces = places;
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
      const popularPlaces = eligiblePlaces
        .filter(place => place.rating >= 4.3)
        .filter(place => !filteredPlaces.some(fp => fp.id === place.id));
      
      filteredPlaces = [...filteredPlaces, ...popularPlaces.slice(0, days * 2 - filteredPlaces.length)];
    }
  }
  
  // Sort places by rating (descending) to prioritize better-rated places
  filteredPlaces.sort((a, b) => b.rating - a.rating);
  
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
      filteredPlaces = [...eligiblePlaces];
      // Re-sort and shuffle a bit to avoid exact repetition
      filteredPlaces.sort(() => Math.random() - 0.5);
    }
    
    // Same for restaurants
    if (filteredRestaurants.length === 0) {
      filteredRestaurants = [...eligibleRestaurants];
      filteredRestaurants.sort(() => Math.random() - 0.5);
    }
  }
  
  return itinerary;
}
