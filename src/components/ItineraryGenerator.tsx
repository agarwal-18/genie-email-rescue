import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from '@/contexts/AuthContext';
import { generateItinerary } from '@/lib/data';
import { Badge } from "@/components/ui/badge";
import { useItinerary } from '@/hooks/useItinerary';

interface ItineraryGeneratorProps {
  onGenerate?: (itinerary: any[], settings: any) => void;
}

// Predefined location options for Navi Mumbai
const LOCATIONS = [
  'Vashi',
  'Nerul',
  'Belapur',
  'Kharghar',
  'Airoli',
  'Seawoods',
  'Panvel',
  'Sanpada',
  'Ulwe',
  'Kopar Khairane',
];

// Predefined interests list
const INTERESTS = [
  'Historical Sites',
  'Museums',
  'Local Cuisine',
  'Outdoor Activities',
  'Shopping',
  'Nightlife',
  'Relaxation',
  'Adventure',
  'Cultural Experiences',
  'Religious Sites',
  'Parks & Gardens',
  'Entertainment'
];

const ItineraryGenerator = ({ onGenerate }: ItineraryGeneratorProps) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Vashi']);
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Outdoor Activities', 'Local Cuisine']);
  const [pace, setPace] = useState('Moderate');
  const [budget, setBudget] = useState('Mid-Range');
  const [transportation, setTransportation] = useState('Public Transportation');
  const [includeFood, setIncludeFood] = useState(true);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itineraryTitle, setItineraryTitle] = useState('Navi Mumbai Exploration');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveItinerary } = useItinerary();

  useEffect(() => {
    if (!user) {
      console.log("No user logged in for itinerary generator");
      // We'll allow users to generate itineraries without logging in,
      // but saving will require login
    }
  }, [user]);

  const handleLocationToggle = (location: string) => {
    if (selectedLocations.includes(location)) {
      // Don't remove if it's the only location left
      if (selectedLocations.length > 1) {
        setSelectedLocations(selectedLocations.filter(loc => loc !== location));
      }
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const generateItineraryHandler = async () => {
    if (!selectedLocations.length || !numberOfDays || !startDate || selectedInterests.length === 0 || !pace || !budget || !transportation) {
      toast({
        title: "Missing information",
        description: "Please fill in all the fields to generate an itinerary.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Using the data.ts generator function with multiple locations
      const generatedItinerary = generateItinerary({
        days: numberOfDays,
        pace: pace.toLowerCase(),
        budget: budget.toLowerCase(),
        interests: selectedInterests,
        includeFood,
        transportation,
        locations: selectedLocations // Pass selected locations array
      });
      
      setItinerary(generatedItinerary);
      
      // Create settings object to pass to the parent component
      const settings = {
        title: itineraryTitle,
        days: numberOfDays,
        start_date: startDate,
        pace,
        budget,
        interests: selectedInterests,
        transportation,
        include_food: includeFood
      };
      
      // If onGenerate callback is provided, pass the itinerary and settings
      if (onGenerate) {
        onGenerate(generatedItinerary, settings);
      }
      
      toast({
        title: "Itinerary generated",
        description: "Your itinerary has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating itinerary:", error);
      toast({
        title: "Error generating itinerary",
        description: "There was an error generating your itinerary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveItineraryHandler = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your itinerary.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (itinerary.length === 0) {
      toast({
        title: "No itinerary generated",
        description: "Please generate an itinerary first.",
        variant: "destructive"
      });
      return;
    }
    
    const settings = {
      title: itineraryTitle,
      days: numberOfDays,
      start_date: startDate,
      pace,
      budget,
      interests: selectedInterests,
      transportation,
      include_food: includeFood
    };
    
    const success = await saveItinerary(settings, itinerary);
    
    if (success) {
      navigate('/saved-itineraries');
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4">Create Your Itinerary</h3>
      
      <div className="space-y-6">
        {/* Multiple Location Selection */}
        <div>
          <Label className="mb-2 block">Locations</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedLocations.map((loc) => (
              <Badge key={loc} variant="secondary" className="flex items-center gap-1">
                {loc}
                <button 
                  onClick={() => handleLocationToggle(loc)}
                  disabled={selectedLocations.length <= 1}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {LOCATIONS.filter(loc => !selectedLocations.includes(loc)).map((loc) => (
              <Badge 
                key={loc} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleLocationToggle(loc)}
              >
                + {loc}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Itinerary Title */}
        <div>
          <Label htmlFor="title">Itinerary Title</Label>
          <Select 
            value={itineraryTitle} 
            onValueChange={setItineraryTitle}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Navi Mumbai Exploration">Navi Mumbai Exploration</SelectItem>
              <SelectItem value="Weekend Getaway">Weekend Getaway</SelectItem>
              <SelectItem value="Culinary Adventure">Culinary Adventure</SelectItem>
              <SelectItem value="Cultural Tour">Cultural Tour</SelectItem>
              <SelectItem value="Nature Retreat">Nature Retreat</SelectItem>
              <SelectItem value="Family Fun Trip">Family Fun Trip</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Number of Days - Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="days">Number of Days: {numberOfDays}</Label>
          </div>
          <Slider
            id="days"
            min={1}
            max={7}
            step={1}
            value={[numberOfDays]}
            onValueChange={(value) => setNumberOfDays(value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
          </div>
        </div>
        
        {/* Start Date */}
        <div>
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Interests - Button Group */}
        <div>
          <Label className="mb-2 block">Interests</Label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <Button
                key={interest}
                variant={selectedInterests.includes(interest) ? "default" : "outline"}
                onClick={() => handleInterestToggle(interest)}
                size="sm"
                className="mb-1"
              >
                {interest}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Pace - Radio Group */}
        <div>
          <Label className="mb-2 block">Pace</Label>
          <RadioGroup value={pace} onValueChange={setPace} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Relaxed" id="relaxed" />
              <Label htmlFor="relaxed">Relaxed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Moderate" id="moderate" />
              <Label htmlFor="moderate">Moderate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Fast-Paced" id="fast" />
              <Label htmlFor="fast">Fast-Paced</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Budget - Radio Group */}
        <div>
          <Label className="mb-2 block">Budget</Label>
          <RadioGroup value={budget} onValueChange={setBudget} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Budget-Friendly" id="budget" />
              <Label htmlFor="budget">Budget</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Mid-Range" id="mid" />
              <Label htmlFor="mid">Mid-Range</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Luxury" id="luxury" />
              <Label htmlFor="luxury">Luxury</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Transportation - Radio Group */}
        <div>
          <Label className="mb-2 block">Transportation</Label>
          <RadioGroup value={transportation} onValueChange={setTransportation} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Public Transportation" id="public" />
              <Label htmlFor="public">Public Transportation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Rental Car" id="car" />
              <Label htmlFor="car">Rental Car</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Mix of Both" id="mix" />
              <Label htmlFor="mix">Mix of Both</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Include Food - Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="includeFood" 
            checked={includeFood}
            onCheckedChange={(checked) => setIncludeFood(checked === true)}
          />
          <Label htmlFor="includeFood">Include Food Recommendations</Label>
        </div>
        
        <Button onClick={generateItineraryHandler} disabled={isLoading} className="w-full">
          {isLoading ? "Generating..." : "Generate Itinerary"}
        </Button>
      </div>
    </div>
  );
};

export default ItineraryGenerator;
