import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ItineraryGeneratorProps {
  
}

const ItineraryGenerator = ({ }: ItineraryGeneratorProps) => {
  const [destination, setDestination] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [interests, setInterests] = useState([
    'Historical Sites',
    'Museums',
    'Local Cuisine',
    'Outdoor Activities',
    'Shopping',
    'Nightlife',
    'Relaxation',
    'Adventure'
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [pace, setPace] = useState('Moderate');
  const [budget, setBudget] = useState('Mid-Range');
  const [transportation, setTransportation] = useState('Public Transportation');
  const [includeFood, setIncludeFood] = useState(true);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [itineraryTitle, setItineraryTitle] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create an itinerary.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);

  const generateItinerary = async () => {
    if (!destination || !numberOfDays || !startDate || selectedInterests.length === 0 || !pace || !budget || !transportation) {
      toast({
        title: "Missing information",
        description: "Please fill in all the fields to generate an itinerary.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Mock AI response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockItinerary = Array.from({ length: numberOfDays }, (_, dayIndex) => ({
      day: dayIndex + 1,
      activities: Array.from({ length: 2 }, (_, activityIndex) => ({
        time: `${9 + activityIndex * 4}:00 AM`,
        title: `Activity ${activityIndex + 1} on Day ${dayIndex + 1}`,
        location: 'Some Location',
        description: 'Some Description',
        image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1287&auto=format&fit=crop',
        category: 'Historical Site'
      }))
    }));
    
    setItinerary(mockItinerary);
    setIsLoading(false);
    
    toast({
      title: "Itinerary generated",
      description: "Your itinerary has been generated successfully."
    });
  };

  const handleInterestClick = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const saveItinerary = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Save the itinerary
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('user_itineraries')
        .insert({
          user_id: user.id,
          title: itineraryTitle || `Trip to ${destination}`,
          days: numberOfDays,
          start_date: startDate,
          pace: pace,
          budget: budget,
          interests: selectedInterests,
          transportation: transportation,
          include_food: includeFood
        })
        .select()
        .single();
      
      if (itineraryError) throw itineraryError;
      
      // Save each activity
      if (itineraryData) {
        const activitiesData = itinerary.flatMap((day, index) => 
          day.activities.map(activity => ({
            itinerary_id: itineraryData.id,
            day: index + 1,
            time: activity.time,
            title: activity.title,
            location: activity.location,
            description: activity.description || null,
            image: activity.image || null,
            category: activity.category || null
          }))
        );
        
        const { error: activitiesError } = await supabase
          .from('itinerary_activities')
          .insert(activitiesData);
        
        if (activitiesError) throw activitiesError;
        
        toast({
          title: "Itinerary saved",
          description: "Your itinerary has been saved successfully."
        });
      }
    } catch (error: any) {
      console.error('Error saving itinerary:', error);
      toast({
        title: "Error saving itinerary",
        description: error.message || "There was an error saving your itinerary.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-4">Create Your Itinerary</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="destination">Destination</Label>
            <Input 
              type="text" 
              id="destination" 
              placeholder="Enter destination" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="title">Itinerary Title (Optional)</Label>
            <Input 
              type="text" 
              id="title" 
              placeholder="My Awesome Trip" 
              value={itineraryTitle}
              onChange={(e) => setItineraryTitle(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="days">Number of Days</Label>
            <Input 
              type="number" 
              id="days" 
              placeholder="Enter number of days" 
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(Number(e.target.value))}
            />
          </div>
          
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
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
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Button
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  onClick={() => handleInterestClick(interest)}
                  size="sm"
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="pace">Pace</Label>
            <Select value={pace} onValueChange={setPace}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select pace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Relaxed">Relaxed</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Fast-Paced">Fast-Paced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Budget-Friendly">Budget-Friendly</SelectItem>
                <SelectItem value="Mid-Range">Mid-Range</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="transportation">Transportation</Label>
            <Select value={transportation} onValueChange={setTransportation}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select transportation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public Transportation">Public Transportation</SelectItem>
                <SelectItem value="Rental Car">Rental Car</SelectItem>
                <SelectItem value="Mix of Both">Mix of Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeFood" 
              checked={includeFood}
              onCheckedChange={(checked: boolean) => setIncludeFood(checked)}
            />
            <Label htmlFor="includeFood">Include Food Recommendations</Label>
          </div>
          
          <Button onClick={generateItinerary} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Itinerary"}
          </Button>
        </div>
        
        {/* Itinerary Section */}
        <div>
          {itinerary.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Generated Itinerary</h3>
              {itinerary.map((day, index) => (
                <div key={index} className="border rounded-md p-4">
                  <h4 className="text-lg font-medium">Day {day.day}</h4>
                  <ul className="list-disc pl-5">
                    {day.activities.map((activity, activityIndex) => (
                      <li key={activityIndex} className="mb-2">
                        <span className="font-semibold">{activity.time}</span>: {activity.title} ({activity.location})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Button variant="secondary" onClick={saveItinerary} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Itinerary"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryGenerator;
