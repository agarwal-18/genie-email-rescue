
import { faker } from '@faker-js/faker';

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
];

const recommendations = {
  "Historical Sites": [
    { name: "Belapur Fort", description: "A historic fort with scenic views. Dating from the 17th century, offering panoramic views of the creek.", image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800" },
    { name: "Pandavkada Falls", description: "A waterfall with mythological significance connected to the Pandavas from Mahabharata.", image: "https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?q=80&w=800" }
  ],
  "Museums": [
    { name: "Navi Mumbai Science Centre", description: "Interactive exhibits for all ages, focusing on science and technology innovations.", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800" }
  ],
  "Food & Drink": [
    { name: "Fish Land", description: "Authentic seafood restaurant serving Konkan delicacies and freshly caught fish.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800" },
    { name: "Pop Tate's", description: "Popular for its sizzlers and continental dishes with a cozy atmosphere.", image: "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800" },
    { name: "Spice Kitchen", description: "Authentic Indian cuisine with a wide range of regional specialties.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800" },
    { name: "Urban Tadka", description: "North Indian delicacies in a modern setting with excellent ambiance.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800" }
  ],
  "Nature & Outdoors": [
    { name: "Central Park", description: "A large park perfect for picnics, jogging, and recreational activities with beautiful landscaping.", image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800" },
    { name: "Mini Seashore", description: "A serene beach for relaxation and enjoying beautiful sunsets over the Arabian Sea.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800" },
    { name: "Parsik Hill", description: "Offers panoramic views of the city and surrounding areas, perfect for hiking and photography.", image: "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?q=80&w=800" }
  ],
  "Shopping": [
    { name: "Inorbit Mall", description: "A premier shopping destination with international and domestic brands, entertainment, and dining options.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800" },
    { name: "Raghuleela Mall", description: "Offers a variety of retail outlets, multiplex cinema, and food court with diverse options.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800" },
    { name: "APMC Market", description: "A bustling market for fresh produce and spices, offering wholesale rates and local specialties.", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800" }
  ],
  "Nightlife": [
    { name: "Someplace Else", description: "A popular spot for live music, craft cocktails and a vibrant evening atmosphere.", image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=800" },
    { name: "The Irish House", description: "Known for its vibrant atmosphere, extensive beer selection and live sports screenings.", image: "https://images.unsplash.com/photo-1543007631-546a79f80ca3?q=80&w=800" }
  ],
  "Relaxation": [
    { name: "Sagar Vihar", description: "A peaceful garden by the sea with walking paths and stunning views of Mumbai's skyline.", image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800" },
    { name: "Jewel of Navi Mumbai", description: "A scenic spot for evening walks with beautiful lighting and landscaping.", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800" }
  ],
  "Adventure": [
    { name: "Wonder Park", description: "An amusement park with thrilling rides, water activities, and entertainment options for all ages.", image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=800" },
    { name: "Tikuji-ni-Wadi", description: "Water park and adventure resort with numerous attractions and outdoor activities.", image: "https://images.unsplash.com/photo-1477065263485-2c2d5a04d965?q=80&w=800" }
  ],
  "Cultural Experiences": [
    { name: "Nerul Balaji Temple", description: "A beautiful South Indian temple with intricate architecture and spiritual significance.", image: "https://images.unsplash.com/photo-1561361058-c24e06f35045?q=80&w=800" },
    { name: "Akshar Dhaam", description: "A modern temple with intricate carvings depicting Hindu mythology and philosophy.", image: "https://images.unsplash.com/photo-1609619385002-f40f1f64e122?q=80&w=800" }
  ],
  "Religious Sites": [
    { name: "Hanuman Temple", description: "A serene place for worship dedicated to Lord Hanuman with traditional architecture.", image: "https://images.unsplash.com/photo-1560337349-a7a7c03a5c89?q=80&w=800" },
    { name: "ISKCON Temple", description: "Beautiful temple dedicated to Lord Krishna with regular spiritual programs and prasadam.", image: "https://images.unsplash.com/photo-1555791019-72d3af01da82?q=80&w=800" }
  ],
  "Parks & Gardens": [
    { name: "Rock Garden", description: "A unique garden with rock formations, waterfalls and beautiful landscaping.", image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800" },
    { name: "Wonders Park", description: "Features replicas of the Seven Wonders of the World along with recreational facilities.", image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=800" }
  ],
  "Family Activities": [
    { name: "DY Patil Stadium", description: "World-class sports venue hosting cricket matches and other entertainment events.", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800" },
    { name: "Snow World", description: "Indoor snow theme park offering a unique winter experience in Mumbai's climate.", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800" },
    { name: "Smaaash", description: "Interactive gaming and entertainment center with virtual reality experiences.", image: "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=800" }
  ]
};

// Add dummy place data for the getAllPlaces function
const places = [
  {
    id: "1",
    name: "Belapur Fort",
    category: "Historical Sites",
    description: "A historic fort with scenic views dating from the 17th century.",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800",
    rating: 4.5,
    location: "Belapur",
    duration: "2 hours",
    featured: true
  },
  {
    id: "2",
    name: "Pandavkada Falls",
    category: "Historical Sites",
    description: "A waterfall with mythological significance connected to the Pandavas.",
    image: "https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?q=80&w=800",
    rating: 4.2,
    location: "Kharghar",
    duration: "3 hours",
    featured: false
  },
  {
    id: "3",
    name: "Navi Mumbai Science Centre",
    category: "Museums",
    description: "Interactive exhibits for all ages focusing on science and technology.",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800",
    rating: 4.0,
    location: "Vashi",
    duration: "4 hours",
    featured: true
  },
  {
    id: "4",
    name: "Inorbit Mall",
    category: "Shopping",
    description: "A premier shopping destination with international and domestic brands.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800",
    rating: 4.3,
    location: "Vashi",
    duration: "3 hours",
    featured: true
  },
  {
    id: "5",
    name: "Central Park",
    category: "Nature & Outdoors",
    description: "A large park perfect for picnics and recreation with beautiful landscaping.",
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800",
    rating: 4.1,
    location: "Kharghar",
    duration: "2 hours",
    featured: false
  }
];

// Always exclude DY Patil Stadium from recommendations unless specifically requested
const excludedByDefault = [];

const generateActivity = (time: string, category: string) => {
  const categoryItems = recommendations[category as keyof typeof recommendations] || [];
  const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
  
  return {
    time,
    title: randomItem?.name || `Explore ${category}`,
    location: faker.location.city(),
    description: randomItem?.description || `Discover the best ${category.toLowerCase()} in the area.`,
    image: randomItem?.image || faker.image.url(),
    category
  };
};

const generateDay = (day: number) => {
  return {
    day,
    activities: timeSlots.slice(0, 5).map(time => generateActivity(time, faker.helpers.arrayElement(Object.keys(recommendations))))
  };
};

// Add the missing getAllPlaces function
export const getAllPlaces = () => {
  return places;
};

export const generateItinerary = ({
  days = 3,
  pace = 'moderate',
  budget = 'medium',
  interests = ['Historical Sites', 'Shopping'],
  includeFood = true,
  transportation = 'public',
  locations = ['Vashi'],
  excludedLocations = [] // User specified excluded locations
}) => {
  // Combine user excluded locations with default excluded locations
  const allExcludedLocations = [...excludedByDefault, ...excludedLocations];
  
  const filteredRecommendations = Object.entries(recommendations).reduce((acc, [category, places]) => {
    acc[category] = places.filter(place => !allExcludedLocations.includes(place.name));
    return acc;
  }, {} as Record<string, any[]>);

  const itinerary = [];

  for (let i = 1; i <= days; i++) {
    const dayActivities = [];
    // Number of activities based on pace
    const numberOfActivities = pace === 'relaxed' ? 3 : pace === 'moderate' ? 5 : 7;
    
    // Make sure Food & Drink is included if includeFood is true
    let availableInterests = [...interests];
    if (includeFood && !availableInterests.includes('Food & Drink')) {
      availableInterests.push('Food & Drink');
    }
    
    // Generate time slots for the day
    const timeSlots = [];
    const startHour = 8; // 8AM
    const endHour = 20; // 8PM
    const interval = (endHour - startHour) / (numberOfActivities - 1);
    
    for (let j = 0; j < numberOfActivities; j++) {
      const hour = Math.floor(startHour + j * interval);
      const minute = Math.round((interval * j - Math.floor(interval * j)) * 60);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      const timeStr = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
      timeSlots.push(timeStr);
    }
    
    // For each time slot, assign an activity
    for (let j = 0; j < numberOfActivities; j++) {
      // Rotate through interests for variety
      const interestIndex = (i + j) % availableInterests.length;
      const interest = availableInterests[interestIndex];
      
      // Special case for meal times
      let category = interest;
      if (includeFood) {
        const time = parseInt(timeSlots[j].split(':')[0]);
        const ampm = timeSlots[j].split(' ')[1];
        const hour24 = ampm === 'PM' && time !== 12 ? time + 12 : time;
        
        if ((hour24 >= 11 && hour24 <= 13) || (hour24 >= 18 && hour24 <= 20)) {
          category = 'Food & Drink';
        }
      }
      
      // Get options for this category
      const options = filteredRecommendations[category] || [];
      
      if (options.length > 0) {
        // Pick an item we haven't used yet if possible
        const usedTitles = dayActivities.map(a => a.title);
        const availableOptions = options.filter(opt => !usedTitles.includes(opt.name));
        const option = availableOptions.length > 0 
          ? availableOptions[Math.floor(Math.random() * availableOptions.length)]
          : options[Math.floor(Math.random() * options.length)];
        
        // Add activity with actual location info
        dayActivities.push({
          time: timeSlots[j],
          title: option.name,
          location: locations[j % locations.length] || locations[0],
          description: option.description,
          image: option.image,
          category
        });
      }
    }

    itinerary.push({
      day: i,
      activities: dayActivities
    });
  }

  return itinerary;
};
