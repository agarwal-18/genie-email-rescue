
interface Place {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  duration?: string;
  location: string;
  featured?: boolean;
}

interface ItineraryOptions {
  days: number;
  pace: string;
  budget: string;
  interests: string[];
  includeFood: boolean;
  transportation: string;
}

interface ItineraryActivity {
  time: string;
  title: string;
  location: string;
  description: string;
  image?: string;
  category: string;
}

interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}

// Sample Navi Mumbai places data
const placesData: Place[] = [
  {
    id: 1,
    name: "DY Patil Stadium",
    category: "Entertainment",
    description: "One of India's most modern cricket stadiums with a capacity of 55,000 spectators. Hosts IPL matches and other major events.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2573&auto=format&fit=crop",
    rating: 4.5,
    duration: "3-4 hours",
    location: "Nerul, Navi Mumbai",
    featured: true
  },
  {
    id: 2,
    name: "Central Park",
    category: "Park",
    description: "A sprawling urban park in the heart of Navi Mumbai with jogging tracks, botanical gardens, and recreational facilities.",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=2574&auto=format&fit=crop",
    rating: 4.3,
    duration: "1-2 hours",
    location: "Kharghar, Navi Mumbai"
  },
  {
    id: 3,
    name: "Flamingo Sanctuary",
    category: "Nature",
    description: "A wetland sanctuary known for thousands of flamingos that migrate here from November to May, creating a stunning pink landscape.",
    image: "https://images.unsplash.com/photo-1593466894764-7b0d900dee9e?q=80&w=2558&auto=format&fit=crop",
    rating: 4.7,
    duration: "2-3 hours",
    location: "Airoli, Navi Mumbai",
    featured: true
  },
  {
    id: 4,
    name: "Inorbit Mall",
    category: "Mall",
    description: "One of the largest shopping destinations in Navi Mumbai with international brands, entertainment zones, and dining options.",
    image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=2569&auto=format&fit=crop",
    rating: 4.2,
    duration: "3-5 hours",
    location: "Vashi, Navi Mumbai"
  },
  {
    id: 5,
    name: "Wonders Park",
    category: "Park",
    description: "A theme park featuring miniature replicas of the Seven Wonders of the World along with boating facilities and gardens.",
    image: "https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=2670&auto=format&fit=crop",
    rating: 4.0,
    duration: "2-3 hours",
    location: "Nerul, Navi Mumbai"
  },
  {
    id: 6,
    name: "Pandavkada Falls",
    category: "Nature",
    description: "A scenic waterfall that comes alive during the monsoon season, surrounded by lush greenery and trekking paths.",
    image: "https://images.unsplash.com/photo-1495527400402-bc0d6f51dbce?q=80&w=2671&auto=format&fit=crop",
    rating: 4.4,
    duration: "2-3 hours",
    location: "Kharghar, Navi Mumbai",
    featured: true
  },
  {
    id: 7,
    name: "ISKCON Temple",
    category: "Temple",
    description: "A magnificent temple dedicated to Lord Krishna with stunning architecture, spiritual atmosphere, and regular cultural events.",
    image: "https://images.unsplash.com/photo-1532849215738-34d9169d0c7a?q=80&w=2572&auto=format&fit=crop",
    rating: 4.6,
    duration: "1-2 hours",
    location: "Kharghar, Navi Mumbai"
  },
  {
    id: 8,
    name: "Seawoods Grand Central Mall",
    category: "Mall",
    description: "A premium shopping and entertainment destination directly connected to the Seawoods railway station with luxury brands and multiplex.",
    image: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?q=80&w=2670&auto=format&fit=crop",
    rating: 4.3,
    duration: "3-4 hours",
    location: "Seawoods, Navi Mumbai"
  },
  {
    id: 9,
    name: "Belapur Fort",
    category: "History",
    description: "A historic fort dating back to the 17th century that offers a glimpse into the region's rich heritage and panoramic views.",
    image: "https://images.unsplash.com/photo-1619060329387-e3fed1c2a20a?q=80&w=2670&auto=format&fit=crop",
    rating: 3.9,
    duration: "1-2 hours",
    location: "CBD Belapur, Navi Mumbai"
  },
  {
    id: 10,
    name: "Parsik Hill",
    category: "Viewpoint",
    description: "A popular viewpoint offering spectacular vistas of Navi Mumbai's skyline and the surrounding landscape, especially at sunset.",
    image: "https://images.unsplash.com/photo-1572869980122-25d973a4ad0c?q=80&w=2574&auto=format&fit=crop",
    rating: 4.2,
    duration: "1-2 hours",
    location: "Airoli, Navi Mumbai"
  },
  {
    id: 11,
    name: "Utsav Chowk",
    category: "Entertainment",
    description: "A vibrant public space with fountains, sculptures, and recreational areas that hosts cultural events and festivals.",
    image: "https://images.unsplash.com/photo-1552242718-c5360894aecd?q=80&w=2670&auto=format&fit=crop",
    rating: 4.0,
    duration: "1 hour",
    location: "Kharghar, Navi Mumbai"
  },
  {
    id: 12,
    name: "Mini Seashore",
    category: "Nature",
    description: "A pleasant promenade along Palm Beach Road with sea views, jogging tracks, and landscaped gardens.",
    image: "https://images.unsplash.com/photo-1621789098261-4494094f8e0a?q=80&w=2670&auto=format&fit=crop",
    rating: 4.1,
    duration: "1-2 hours",
    location: "Nerul, Navi Mumbai"
  },
  {
    id: 13,
    name: "Raghuleela Mall",
    category: "Mall",
    description: "A popular shopping center with a diverse range of stores, food outlets, and entertainment options for the whole family.",
    image: "https://images.unsplash.com/photo-1605184861733-be9f5814095d?q=80&w=2574&auto=format&fit=crop",
    rating: 3.8,
    duration: "2-3 hours",
    location: "Vashi, Navi Mumbai"
  },
  {
    id: 14,
    name: "Paradise Beach",
    category: "Nature",
    description: "A secluded beach offering a peaceful retreat with calm waters and scenic coastal views, perfect for a relaxing day out.",
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2670&auto=format&fit=crop",
    rating: 4.2,
    duration: "3-4 hours",
    location: "Uran, Navi Mumbai"
  },
  {
    id: 15,
    name: "Nerul Balaji Temple",
    category: "Temple",
    description: "A beautiful temple dedicated to Lord Balaji with South Indian architecture and a serene atmosphere for worship.",
    image: "https://images.unsplash.com/photo-1601982012647-e4e32f578a33?q=80&w=2574&auto=format&fit=crop",
    rating: 4.5,
    duration: "1 hour",
    location: "Nerul, Navi Mumbai"
  }
];

// Sample restaurant data
const restaurantsData = [
  {
    id: 101,
    name: "Urban Tadka",
    category: "Restaurant",
    cuisine: "North Indian",
    description: "Popular restaurant serving authentic North Indian cuisine in a contemporary setting.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop",
    rating: 4.3,
    priceRange: "Medium",
    location: "Vashi, Navi Mumbai"
  },
  {
    id: 102,
    name: "Coastal Spice",
    category: "Restaurant",
    cuisine: "Seafood",
    description: "Specialty seafood restaurant featuring fresh catches and coastal delicacies.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2670&auto=format&fit=crop",
    rating: 4.5,
    priceRange: "High",
    location: "Belapur, Navi Mumbai"
  },
  {
    id: 103,
    name: "Café Horizon",
    category: "Restaurant",
    cuisine: "Continental",
    description: "Trendy café with panoramic views serving international cuisine and artisanal coffee.",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2646&auto=format&fit=crop",
    rating: 4.2,
    priceRange: "Medium",
    location: "Kharghar, Navi Mumbai"
  },
  {
    id: 104,
    name: "Maharaja Thali",
    category: "Restaurant",
    cuisine: "Vegetarian",
    description: "Traditional vegetarian thali restaurant offering unlimited authentic Gujarati and Rajasthani dishes.",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=2564&auto=format&fit=crop",
    rating: 4.4,
    priceRange: "Low",
    location: "Vashi, Navi Mumbai"
  },
  {
    id: 105,
    name: "Sushi Bay",
    category: "Restaurant",
    cuisine: "Japanese",
    description: "Modern Japanese restaurant specializing in sushi, sashimi, and other authentic dishes.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2670&auto=format&fit=crop",
    rating: 4.6,
    priceRange: "High",
    location: "Seawoods, Navi Mumbai"
  }
];

// Data access functions
export const getAllPlaces = (): Place[] => {
  return placesData;
};

export const getPopularPlaces = (): Place[] => {
  return placesData.filter(place => place.rating >= 4.3);
};

export const getPlacesByCategory = (category: string): Place[] => {
  return placesData.filter(place => place.category === category);
};

export const getRestaurants = (priceRange?: string): any[] => {
  if (priceRange) {
    return restaurantsData.filter(restaurant => restaurant.priceRange === priceRange);
  }
  return restaurantsData;
};

// Helper function to get random time slots based on pace
const getTimeSlots = (pace: string, count: number): string[] => {
  const slots = [];
  let startHour = 9; // Start at 9 AM
  
  const activityDuration = pace === 'relaxed' ? 3 : pace === 'moderate' ? 2 : 1.5;
  const breakDuration = pace === 'relaxed' ? 1.5 : pace === 'moderate' ? 1 : 0.5;
  
  for (let i = 0; i < count; i++) {
    const startTime = `${startHour}:00`;
    startHour += activityDuration;
    
    if (startHour >= 12) {
      slots.push(startTime + (startHour-activityDuration < 12 ? ' AM' : ' PM'));
    } else {
      slots.push(startTime + ' AM');
    }
    
    // Add break time after each activity except the last one
    if (i < count - 1) {
      startHour += breakDuration;
    }
    
    // Ensure we don't exceed reasonable hours
    if (startHour > 21) {
      break;
    }
  }
  
  return slots;
};

// Mock itinerary generator
export const generateItinerary = (options: ItineraryOptions): ItineraryDay[] => {
  const { days, pace, budget, interests, includeFood, transportation } = options;
  const itinerary: ItineraryDay[] = [];
  
  // Filter places based on interests
  let filteredPlaces = [...placesData];
  if (interests.length > 0) {
    filteredPlaces = filteredPlaces.filter(place => 
      interests.some(interest => 
        place.category.toLowerCase().includes(interest.toLowerCase()) || 
        place.description.toLowerCase().includes(interest.toLowerCase())
      )
    );
  }
  
  // If not enough places based on interests, add more
  if (filteredPlaces.length < days * 3) {
    const additionalPlaces = placesData.filter(place => !filteredPlaces.includes(place));
    filteredPlaces = [...filteredPlaces, ...additionalPlaces.slice(0, days * 3 - filteredPlaces.length)];
  }
  
  // Shuffle places to get random selection
  filteredPlaces = filteredPlaces.sort(() => Math.random() - 0.5);
  
  // Get restaurants based on budget
  let mealPlaces = restaurantsData;
  if (budget === 'budget') {
    mealPlaces = restaurantsData.filter(r => r.priceRange === 'Low');
  } else if (budget === 'medium') {
    mealPlaces = restaurantsData.filter(r => r.priceRange === 'Medium' || r.priceRange === 'Low');
  }
  
  // Create itinerary for each day
  for (let day = 1; day <= days; day++) {
    const activities: ItineraryActivity[] = [];
    const dailyPlaces = filteredPlaces.slice((day - 1) * 3, day * 3);
    
    // Number of activities based on pace
    const numActivities = pace === 'relaxed' ? 3 : pace === 'moderate' ? 4 : 5;
    
    // Get time slots
    const timeSlots = getTimeSlots(pace, includeFood ? numActivities + 2 : numActivities);
    
    // Add breakfast if includeFood
    if (includeFood) {
      const breakfast = mealPlaces[Math.floor(Math.random() * mealPlaces.length)];
      activities.push({
        time: '8:00 AM',
        title: `Breakfast at ${breakfast.name}`,
        location: breakfast.location,
        description: `Start your day with a delicious meal at this ${breakfast.cuisine} restaurant.`,
        category: 'Food'
      });
    }
    
    // Add morning activities
    for (let i = 0; i < Math.min(2, dailyPlaces.length); i++) {
      const place = dailyPlaces[i];
      activities.push({
        time: timeSlots[activities.length],
        title: place.name,
        location: place.location,
        description: place.description,
        image: place.image,
        category: place.category
      });
    }
    
    // Add lunch if includeFood
    if (includeFood) {
      const lunch = mealPlaces[Math.floor(Math.random() * mealPlaces.length)];
      activities.push({
        time: '13:00 PM',
        title: `Lunch at ${lunch.name}`,
        location: lunch.location,
        description: `Enjoy ${lunch.cuisine} cuisine in a ${lunch.priceRange.toLowerCase()} price range setting.`,
        image: lunch.image,
        category: 'Food'
      });
    }
    
    // Add afternoon activities
    for (let i = 2; i < Math.min(dailyPlaces.length, numActivities); i++) {
      if (dailyPlaces[i]) {
        const place = dailyPlaces[i];
        activities.push({
          time: timeSlots[activities.length],
          title: place.name,
          location: place.location,
          description: place.description,
          image: place.image,
          category: place.category
        });
      }
    }
    
    // Add dinner if includeFood
    if (includeFood) {
      const dinner = mealPlaces[Math.floor(Math.random() * mealPlaces.length)];
      activities.push({
        time: '19:30 PM',
        title: `Dinner at ${dinner.name}`,
        location: dinner.location,
        description: `End your day with wonderful ${dinner.cuisine} food and ambiance.`,
        image: dinner.image,
        category: 'Food'
      });
    }
    
    itinerary.push({
      day,
      activities
    });
  }
  
  return itinerary;
};
