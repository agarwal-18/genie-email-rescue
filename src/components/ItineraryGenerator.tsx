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
import { API_CONFIG, ItineraryActivityBase, ItineraryDayBase, ItinerarySettings } from '@/config';
import { useToast } from '@/hooks/use-toast';

interface ItineraryGeneratorProps {
  onGenerate: (itinerary: ItineraryDayBase[], settings: ItinerarySettings) => void;
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

const ItineraryGenerator = ({ onGenerate, initialData }: ItineraryGeneratorProps) => {
  const [title, setTitle] = useState(initialData?.title || 'Navi Mumbai Itinerary');
  const [days, setDays] = useState(initialData?.days || 3);
  const [pace, setPace] = useState(initialData?.pace || 'moderate');
  const [budget, setBudget] = useState(initialData?.budget || 'Mid-Range');
  const [interests, setInterests] = useState<string[]>(initialData?.interests || ['Historical Sites', 'Shopping']);
  const [transportation, setTransportation] = useState(initialData?.transportation || 'public');
  const [includeFood, setIncludeFood] = useState(initialData?.include_food !== null ? initialData?.include_food : true);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.start_date ? 
      (typeof initialData.start_date === 'string' ? new Date(initialData.start_date) : initialData.start_date) : 
      undefined
  );
  const { toast } = useToast();
  
  // Function to get a random image from the default images array
  const getRandomLocationImage = (): string => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    return defaultImages[randomIndex];
  };

  const generateItinerary = async (settings: ItinerarySettings): Promise<ItineraryDayBase[]> => {
    // Basic itinerary template
    const itineraryTemplate = {
      title: settings.title,
      days: Array.from({ length: settings.days }, (_, i) => ({
        day: i + 1,
        activities: [] as ItineraryActivityBase[]
      }))
    };
    
    // Mock activities based on interests
    const mockActivities: Record<string, ItineraryActivityBase[]> = {
      'Historical Sites': [
        { 
          title: 'Explore Belapur Fort', 
          location: 'Belapur Fort', 
          description: 'Visit the historic Belapur Fort and learn about its significance.',
          time: '9:00 AM',
          image: getRandomLocationImage(),
          category: 'Historical Sites' 
        },
        { 
          title: 'Visit Pandavkada Falls', 
          location: 'Pandavkada Falls', 
          description: 'Explore the ancient cave temples and enjoy the natural surroundings.',
          time: '10:00 AM',
          image: getRandomLocationImage(),
          category: 'Historical Sites' 
        }
      ],
      'Shopping': [
        { 
          title: 'Shop at Seawoods Grand Central', 
          location: 'Seawoods Grand Central', 
          description: 'Enjoy shopping at Seawoods Grand Central, one of the largest malls in Navi Mumbai.',
          time: '11:00 AM',
          image: getRandomLocationImage(),
          category: 'Shopping' 
        },
        { 
          title: 'Visit Little World Mall', 
          location: 'Little World Mall', 
          description: 'Shop for local handicrafts and souvenirs at Little World Mall.',
          time: '1:00 PM',
          image: getRandomLocationImage(),
          category: 'Shopping' 
        }
      ],
      'Food & Drink': [
        { 
          title: 'Try street food in Vashi', 
          location: 'Vashi', 
          description: 'Sample local street food delicacies in Vashi.',
          time: '12:00 PM',
          image: getRandomLocationImage(),
          category: 'Food & Drink'
        },
        { 
          title: 'Dine at Pop Tate\'s', 
          location: 'Pop Tate\'s', 
          description: 'Enjoy a meal at Pop Tate\'s.',
          time: '7:00 PM',
          image: getRandomLocationImage(),
          category: 'Food & Drink' 
        }
      ],
      'Nature & Outdoors': [
        { 
          title: 'Walk at Jewel of Navi Mumbai', 
          location: 'Jewel of Navi Mumbai', 
          description: 'Take a walk at Jewel of Navi Mumbai.',
          time: '4:00 PM',
          image: getRandomLocationImage(),
          category: 'Nature & Outdoors' 
        },
        { 
          title: 'Visit Kharghar Hills', 
          location: 'Kharghar Hills', 
          description: 'Hike in the scenic Kharghar Hills.',
          time: '9:00 AM',
          image: getRandomLocationImage(),
          category: 'Nature & Outdoors' 
        }
      ],
      'Museums & Galleries': [
        { 
          title: 'Visit Navi Mumbai Science Centre', 
          location: 'Navi Mumbai Science Centre', 
          description: 'Explore the exhibits at the Navi Mumbai Science Centre.',
          time: '1:00 PM',
          image: getRandomLocationImage(),
          category: 'Museums & Galleries' 
        },
        { 
          title: 'Visit the nearby museum', 
          location: 'Science Centre', 
          description: 'Explore the exhibits at the Science Centre.',
          time: '3:00 PM',
          image: getRandomLocationImage(),
          category: 'Museums & Galleries' 
        }
      ],
      'Nightlife': [
        { 
          title: 'Enjoy nightlife at Someplace Else', 
          location: 'Someplace Else', 
          description: 'Enjoy the nightlife at Someplace Else.',
          time: '8:00 PM',
          image: getRandomLocationImage(),
          category: 'Nightlife' 
        },
        { 
          title: 'Visit The Irish House', 
          location: 'The Irish House', 
          description: 'Enjoy the nightlife at The Irish House.',
          time: '9:00 PM',
          image: getRandomLocationImage(),
          category: 'Nightlife' 
        }
      ],
      'Family Activities': [
        { 
          title: 'Visit Wonder Park', 
          location: 'Wonder Park', 
          description: 'Spend time with family at Wonder Park.',
          time: '11:00 AM',
          image: getRandomLocationImage(),
          category: 'Family Activities' 
        },
        { 
          title: 'Visit Central Park', 
          location: 'Central Park', 
          description: 'Spend time with family at Central Park.',
          time: '2:00 PM',
          image: getRandomLocationImage(),
          category: 'Family Activities' 
        }
      ],
      'Adventure': [
        { 
          title: 'Trekking at Kharghar Hills', 
          location: 'Kharghar Hills', 
          description: 'Enjoy trekking at Kharghar Hills.',
          time: '8:00 AM',
          image: getRandomLocationImage(),
          category: 'Adventure' 
        },
        { 
          title: 'Visit Pandavkada Falls', 
          location: 'Pandavkada Falls', 
          description: 'Enjoy the natural surroundings at Pandavkada Falls.',
          time: '10:00 AM',
          image: getRandomLocationImage(),
          category: 'Adventure' 
        }
      ],
      'Relaxation': [
        { 
          title: 'Relax at Sagar Vihar', 
          location: 'Sagar Vihar', 
          description: 'Relax at Sagar Vihar.',
          time: '4:00 PM',
          image: getRandomLocationImage(),
          category: 'Relaxation' 
        },
        { 
          title: 'Visit Nerul Lake', 
          location: 'Nerul Lake', 
          description: 'Relax at Nerul Lake.',
          time: '5:00 PM',
          image: getRandomLocationImage(),
          category: 'Relaxation' 
        }
      ],
      'Cultural Experiences': [
        { 
          title: 'Visit Hanuman Temple', 
          location: 'Hanuman Temple', 
          description: 'Visit the Hanuman Temple.',
          time: '7:00 AM',
          image: getRandomLocationImage(),
          category: 'Cultural Experiences' 
        },
        { 
          title: 'Visit Rock Garden', 
          location: 'Rock Garden', 
          description: 'Visit the Rock Garden.',
          time: '3:00 PM',
          image: getRandomLocationImage(),
          category: 'Cultural Experiences' 
        }
      ]
    };
    
    // Assign activities to days based on interests
    itineraryTemplate.days.forEach(day => {
      const selectedInterests = interests.filter(interest => mockActivities[interest]);
      
      selectedInterests.forEach(interest => {
        const activitiesForInterest = mockActivities[interest];
        if (activitiesForInterest && activitiesForInterest.length > 0) {
          // Add a random activity for each selected interest
          const randomIndex = Math.floor(Math.random() * activitiesForInterest.length);
          day.activities.push(activitiesForInterest[randomIndex]);
        }
      });
    });

    // Process the itinerary to format activities and assign times
    const processedItinerary: ItineraryDayBase[] = [];
    
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
    
    if (!title || !days) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
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
      include_food: includeFood
    };
    
    const itinerary = await generateItinerary(settings);
    onGenerate(itinerary, settings);
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
