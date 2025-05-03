import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { API_CONFIG, ItinerarySettings } from '@/config';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface ItineraryGeneratorProps {
  onGenerate: (itinerary: ItineraryDay[], settings: ItinerarySettings) => void;
  initialData?: ItinerarySettings | null;
}

const interestsList = [
  'Historical Sites',
  'Shopping',
  'Food & Drink',
  'Nature & Outdoors',
  'Museums & Galleries',
  'Nightlife',
  'Family Activities',
  'Adventure',
  'Relaxation',
  'Cultural Experiences'
];

const locationsList = [
  'Vashi',
  'Nerul',
  'Kharghar',
  'CBD Belapur',
  'Airoli',
  'Sanpada',
  'Kopar Khairane',
  'Ghansoli',
  'Turbhe',
  'Seawoods',
  'Panvel'
];

const defaultImages = [
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=800',
  'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?q=80&w=800',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800',
  'https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=800',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=800'
];

// Add this function to ensure times are distributed evenly throughout the day
const generateTimeSlots = (numberOfActivities: number): string[] => {
  // Start at 8:00 AM and end at 8:00 PM (12 hour span)
  const startHour = 8;
  const endHour = 20;
  const totalHours = endHour - startHour;
  
  // Create an array of evenly distributed time slots
  const timeSlots: string[] = [];
  const interval = totalHours / (numberOfActivities || 1);
  
  for (let i = 0; i < numberOfActivities; i++) {
    const hour = Math.floor(startHour + i * interval);
    const minute = Math.round((startHour + i * interval - hour) * 60);
    
    // Format as 12-hour time with AM/PM
    const hourFormatted = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const minuteFormatted = minute < 10 ? `0${minute}` : minute;
    
    timeSlots.push(`${hourFormatted}:${minuteFormatted} ${ampm}`);
  }
  
  return timeSlots;
};

// Function to get a random image from the default images array
const getRandomLocationImage = (): string => {
  const randomIndex = Math.floor(Math.random() * defaultImages.length);
  return defaultImages[randomIndex];
};

const ItineraryGenerator = ({ onGenerate, initialData }: ItineraryGeneratorProps) => {
  const [title, setTitle] = useState(initialData?.title || 'Navi Mumbai Itinerary');
  const [days, setDays] = useState(initialData?.days || 3);
  const [pace, setPace] = useState(initialData?.pace || 'moderate');
  const [budget, setBudget] = useState(initialData?.budget || 'Mid-Range');
  const [interests, setInterests] = useState<string[]>(initialData?.interests || ['Historical Sites', 'Shopping']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialData?.locations || ['Vashi', 'Nerul']);
  const [transportation, setTransportation] = useState(initialData?.transportation || 'public');
  const [includeFood, setIncludeFood] = useState(initialData?.include_food !== null ? initialData?.include_food : true);
  const [allLocations, setAllLocations] = useState<string[]>(locationsList);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.start_date ? 
      (typeof initialData.start_date === 'string' ? new Date(initialData.start_date) : initialData.start_date) : 
      undefined
  );
  const { toast } = useToast();
  const [availablePlaces, setAvailablePlaces] = useState<any[]>([]);
  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
  
  // Fetch places and restaurants data
  useEffect(() => {
    const fetchPlacesData = async () => {
      try {
        const placesResponse = await axios.get(`${API_CONFIG.baseUrl}/places`);
        if (placesResponse.data && placesResponse.data.places) {
          setAvailablePlaces(placesResponse.data.places);
        }
        
        const restaurantsResponse = await axios.get(`${API_CONFIG.baseUrl}/restaurants`);
        if (restaurantsResponse.data && restaurantsResponse.data.restaurants) {
          setAvailableRestaurants(restaurantsResponse.data.restaurants);
        }
        
        // Also fetch available locations
        const locationsResponse = await axios.get(`${API_CONFIG.baseUrl}/locations`);
        if (locationsResponse.data && locationsResponse.data.locations) {
          setAllLocations(locationsResponse.data.locations);
        }
      } catch (error) {
        console.error("Error fetching places data:", error);
      }
    };
    
    fetchPlacesData();
  }, []);

  const generateItinerary = async (settings: ItinerarySettings): Promise<ItineraryDay[]> => {
    // Filter available places by selected locations
    const filteredPlaces = availablePlaces.filter(place => 
      selectedLocations.includes(place.location)
    );
    
    const filteredRestaurants = availableRestaurants.filter(restaurant => 
      selectedLocations.includes(restaurant.location)
    );
    
    // Basic itinerary template
    const itineraryTemplate = {
      title: settings.title,
      days: Array.from({ length: settings.days }, (_, i) => ({
        day: i + 1,
        activities: [] as ItineraryActivity[]
      }))
    };
    
    // Define mock activities with proper types
    const createMockActivity = (
      title: string,
      location: string,
      description: string,
      category: string,
      image: string
    ): ItineraryActivity => {
      return {
        title,
        location,
        description,
        time: "9:00 AM", // This will be replaced later
        image,
        category
      };
    };
    
    // Create category to place mapping
    const mockActivities: Record<string, ItineraryActivity[]> = {};
    
    // Fill mock activities from filtered places
    interestsList.forEach(interest => {
      const placesForInterest = filteredPlaces.filter(place => {
        return place.category === interest || 
               (interest === 'Historical Sites' && place.category === 'Historical Sites') ||
               (interest === 'Shopping' && place.category === 'Shopping') ||
               (interest === 'Nature & Outdoors' && ['Nature', 'Parks & Gardens'].includes(place.category)) ||
               (interest === 'Family Activities' && ['Amusement', 'Parks & Gardens'].includes(place.category)) ||
               (interest === 'Adventure' && ['Adventure', 'Nature'].includes(place.category)) ||
               (interest === 'Cultural Experiences' && ['Religious Sites', 'Historical Sites'].includes(place.category));
      });
      
      // If we have places for this interest, add them to mock activities
      if (placesForInterest.length > 0) {
        mockActivities[interest] = placesForInterest.map(place => createMockActivity(
          place.name,
          place.location,
          place.description,
          interest,
          place.image
        ));
      } else {
        // Fallback if no matching places
        mockActivities[interest] = [
          createMockActivity(
            `Explore ${interest} in ${selectedLocations[0] || 'Navi Mumbai'}`,
            selectedLocations[0] || 'Navi Mumbai',
            `Discover the best ${interest.toLowerCase()} in the area.`,
            interest,
            getRandomLocationImage()
          )
        ];
      }
    });
    
    // If include food is enabled, add food recommendations
    if (includeFood) {
      if (filteredRestaurants.length > 0) {
        mockActivities['Food & Drink'] = filteredRestaurants.map(restaurant => createMockActivity(
          `Dine at ${restaurant.name}`,
          restaurant.location,
          `${restaurant.description} Try their signature dish: ${restaurant.signature_dish || 'house specialties'}.`,
          'Food & Drink',
          restaurant.image
        ));
      } else {
        mockActivities['Food & Drink'] = [
          createMockActivity(
            `Explore local cuisine in ${selectedLocations[0] || 'Navi Mumbai'}`,
            selectedLocations[0] || 'Navi Mumbai',
            'Sample delicious local dishes at one of the area\'s top-rated restaurants.',
            'Food & Drink',
            getRandomLocationImage()
          )
        ];
      }
      
      // Make sure Food & Drink is included in interests if includeFood is true
      if (!interests.includes('Food & Drink')) {
        interests.push('Food & Drink');
      }
    }
    
    // Assign activities to days based on interests
    itineraryTemplate.days.forEach(day => {
      const selectedInterests = interests.filter(interest => mockActivities[interest]);
      const activitiesForDay: ItineraryActivity[] = [];
      
      // Number of activities based on pace
      const activitiesCount = pace === 'relaxed' ? 3 : pace === 'moderate' ? 4 : 5;
      
      // Distribute interests throughout the days
      for (let i = 0; i < activitiesCount; i++) {
        const interestIndex = (i + day.day) % selectedInterests.length;
        const interest = selectedInterests[interestIndex];
        
        if (mockActivities[interest] && mockActivities[interest].length > 0) {
          // Pick an activity we haven't used yet if possible
          const activityIndex = (day.day + i) % mockActivities[interest].length;
          const activity = mockActivities[interest][activityIndex];
          
          // Add this activity if we haven't already included it
          if (!activitiesForDay.some(a => a.title === activity.title)) {
            activitiesForDay.push({...activity});
          }
        }
      }
      
      day.activities = activitiesForDay;
    });

    // Process the itinerary to assign evenly distributed time slots
    const processedItinerary: ItineraryDay[] = [];
    
    itineraryTemplate.days.forEach(day => {
      const activities = day.activities || [];
      
      // Generate evenly distributed time slots for this day's activities
      const timeSlots = generateTimeSlots(activities.length);
      
      // Assign times to activities
      const processedActivities = activities.map((activity, index) => {
        return {
          ...activity,
          time: timeSlots[index],
          image: activity.image || getRandomLocationImage()
        };
      });
      
      processedItinerary.push({
        day: day.day,
        activities: processedActivities
      });
    });
    
    // Return the generated itinerary
    return processedItinerary;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !days || selectedLocations.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select at least one location.",
        variant: "destructive"
      });
      return;
    }
    
    const settings: ItinerarySettings = {
      title,
      days,
      start_date: date,
      pace,
      budget,
      interests,
      transportation,
      include_food: includeFood,
      locations: selectedLocations
    };
    
    const itinerary = await generateItinerary(settings);
    onGenerate(itinerary, settings);
  };

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(loc => loc !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itinerary Generator</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input 
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="days">Number of Days</Label>
          <Input
            type="number"
            id="days"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            min="1"
            max="7"
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="pace">Pace</Label>
          <Select value={pace} onValueChange={setPace}>
            <SelectTrigger id="pace">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relaxed">Relaxed</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value=" Energetic"> Energetic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget</Label>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger id="budget">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Economical">Economical</SelectItem>
              <SelectItem value="Mid-Range">Mid-Range</SelectItem>
              <SelectItem value="Luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label>Interests</Label>
          <div className="flex flex-wrap gap-2">
            {interestsList.map((interest) => (
              <Button
                key={interest}
                variant={interests.includes(interest) ? "default" : "outline"}
                onClick={() => {
                  if (interests.includes(interest)) {
                    setInterests(interests.filter((i) => i !== interest));
                  } else {
                    setInterests([...interests, interest]);
                  }
                }}
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Locations</Label>
          <div className="flex flex-wrap gap-2">
            {allLocations.map((location) => (
              <Button
                key={location}
                variant={selectedLocations.includes(location) ? "default" : "outline"}
                onClick={() => toggleLocation(location)}
                size="sm"
              >
                {location}
              </Button>
            ))}
          </div>
          {selectedLocations.length === 0 && (
            <p className="text-xs text-destructive">Please select at least one location</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="transportation">Transportation</Label>
          <Select value={transportation} onValueChange={setTransportation}>
            <SelectTrigger id="transportation">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public Transportation</SelectItem>
              <SelectItem value="private">Private Vehicle</SelectItem>
              <SelectItem value="mixed">Mixed (Public & Private)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="includeFood" 
            checked={includeFood} 
            onCheckedChange={(checked) => setIncludeFood(!!checked)} 
          />
          <Label htmlFor="includeFood">Include Food Recommendations</Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit}>Generate Itinerary</Button>
      </CardFooter>
    </Card>
  );
};

export default ItineraryGenerator;
