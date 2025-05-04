// import { faker } from '@faker-js/faker';

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
];

const recommendations = {
  "Historical Sites": [
    { name: "Belapur Fort", description: "A historic fort with scenic views.", image: "https://example.com/belapur_fort.jpg" },
    { name: "Pandavkada Falls", description: "A waterfall with mythological significance.", image: "https://example.com/pandavkada_falls.jpg" }
  ],
  "Museums": [
    { name: "Navi Mumbai Science Centre", description: "Interactive exhibits for all ages.", image: "https://example.com/science_centre.jpg" }
  ],
  "Local Cuisine": [
    { name: "Fish Land", description: "Authentic seafood restaurant.", image: "https://example.com/fish_land.jpg" },
    { name: "Pop Tate's", description: "Popular for its sizzlers and continental dishes.", image: "https://example.com/pop_tates.jpg" }
  ],
  "Outdoor Activities": [
    { name: "Central Park", description: "A large park perfect for picnics and recreation.", image: "https://example.com/central_park.jpg" },
    { name: "Mini Seashore", description: "A serene beach for relaxation.", image: "https://example.com/mini_seashore.jpg" },
    { name: "Parsik Hill", description: "Offers panoramic views of the city.", image: "https://example.com/parsik_hill.jpg" }
  ],
  "Shopping": [
    { name: "Inorbit Mall", description: "A premier shopping destination.", image: "https://example.com/inorbit_mall.jpg" },
    { name: "Raghuleela Mall", description: "Offers a variety of retail outlets.", image: "https://example.com/raghuleela_mall.jpg" },
    { name: "APMC Market", description: "A bustling market for fresh produce and spices.", image: "https://example.com/apmc_market.jpg" }
  ],
  "Nightlife": [
    { name: "Someplace Else", description: "A popular spot for live music.", image: "https://example.com/someplace_else.jpg" },
    { name: "The Irish House", description: "Known for its vibrant atmosphere.", image: "https://example.com/irish_house.jpg" }
  ],
  "Relaxation": [
    { name: "Sagar Vihar", description: "A peaceful garden by the sea.", image: "https://example.com/sagar_vihar.jpg" },
    { name: "Jewel of Navi Mumbai", description: "A scenic spot for evening walks.", image: "https://example.com/jewel_of_navi_mumbai.jpg" }
  ],
  "Adventure": [
    { name: "Wonder Park", description: "An amusement park with thrilling rides.", image: "https://example.com/wonder_park.jpg" },
  ],
  "Cultural Experiences": [
    { name: "Nerul Balaji Temple", description: "A beautiful South Indian temple.", image: "https://www.holidify.com/images/cmsuploads/square/dsfsdf_20190314154524.jpg" },
    { name: "Akshar Dhaam", description: "A modern temple with intricate carvings.", image: "https://example.com/akshar_dhaam.jpg" }
  ],
  "Religious Sites": [
    { name: "Hanuman Temple", description: "A serene place for worship.", image: "https://example.com/hanuman_temple.jpg" }
  ],
  "Parks & Gardens": [
    { name: "Rock Garden", description: "A unique garden with rock formations.", image: "https://example.com/rock_garden.jpg" },
    { name: "Wonders Park", description: "Features replicas of the Seven Wonders.", image: "https://example.com/wonders_park.jpg" }
  ],
  "Entertainment": [
    { name: "Little Theatre", description: "A venue for local plays and performances.", image: "https://example.com/little_theatre.jpg" },
    { name: "INOX", description: "A popular cinema for the latest movies.", image: "https://example.com/inox.jpg" }
  ]
};

// Add dummy place data for the getAllPlaces function
const places = [
  {
    id: "1",
    name: "Belapur Fort",
    category: "Historical Sites",
    description: "A historic fort with scenic views.",
    image: "https://example.com/belapur_fort.jpg",
    rating: 4.5,
    location: "Belapur",
    duration: "2 hours",
    featured: true
  },
  {
    id: "2",
    name: "Pandavkada Falls",
    category: "Historical Sites",
    description: "A waterfall with mythological significance.",
    image: "https://example.com/pandavkada_falls.jpg",
    rating: 4.2,
    location: "Kharghar",
    duration: "3 hours",
    featured: false
  },
  {
    id: "3",
    name: "Navi Mumbai Science Centre",
    category: "Museums",
    description: "Interactive exhibits for all ages.",
    image: "https://example.com/science_centre.jpg",
    rating: 4.0,
    location: "Vashi",
    duration: "4 hours",
    featured: true
  },
  {
    id: "4",
    name: "Inorbit Mall",
    category: "Shopping",
    description: "A premier shopping destination.",
    image: "https://example.com/inorbit_mall.jpg",
    rating: 4.3,
    location: "Vashi",
    duration: "3 hours",
    featured: true
  },
  {
    id: "5",
    name: "Central Park",
    category: "Outdoor Activities",
    description: "A large park perfect for picnics and recreation.",
    image: "https://i.ytimg.com/vi/LXIPWZDZzwc/maxresdefault.jpg", // Updated image as requested
    rating: 4.1,
    location: "Kharghar",
    duration: "2 hours",
    featured: false
  }
];

// Always exclude DY Patil Stadium from recommendations
const excludedByDefault = ["DY Patil Stadium"];

const generateActivity = (time: string) => {
  return {
    time,
    title: faker.lorem.sentence(),
    location: faker.location.city(),
    description: faker.lorem.paragraph(),
    image: faker.image.url(),
    category: faker.helpers.arrayElement(Object.keys(recommendations))
  };
};

const generateDay = (day: number) => {
  return {
    day,
    activities: timeSlots.map(generateActivity)
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
    const numberOfActivities = pace === 'relaxed' ? 3 : pace === 'moderate' ? 5 : 7;

    for (let j = 0; j < numberOfActivities; j++) {
      const time = timeSlots[j % timeSlots.length];
      const interest = interests[j % interests.length];
      const place = faker.helpers.arrayElement(filteredRecommendations[interest]);

      dayActivities.push({
        time: time,
        title: place.name,
        location: locations[j % locations.length],
        description: place.description,
        image: place.image,
        category: interest
      });
    }

    itinerary.push({
      day: i,
      activities: dayActivities
    });
  }

  return itinerary;
};
