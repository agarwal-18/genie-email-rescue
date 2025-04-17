import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useItinerary } from '@/hooks/useItinerary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

interface ItinerarySettings {
  title: string;
  days: number;
  start_date: Date | null;
  pace: string;
  budget: string;
  interests: string[];
  transportation: string;
  include_food: boolean;
}

const ItineraryGenerator = () => {
  const [settings, setSettings] = useState<ItinerarySettings>({
    title: '',
    days: 3,
    start_date: null,
    pace: 'moderate',
    budget: 'medium',
    interests: [],
    transportation: 'car',
    include_food: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { saveItinerary } = useItinerary();
  const navigate = useNavigate();
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      include_food: e.target.checked,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleInterestChange = (interest: string) => {
    setSettings(prevSettings => {
      if (prevSettings.interests.includes(interest)) {
        return {
          ...prevSettings,
          interests: prevSettings.interests.filter(i => i !== interest),
        };
      } else {
        return {
          ...prevSettings,
          interests: [...prevSettings.interests, interest],
        };
      }
    });
  };

  const handleGenerateItinerary = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save your itinerary.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    if (!settings.title) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your itinerary.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create itinerary structure
      const itinerarySettings = {
        title: settings.title,
        days: settings.days,
        start_date: settings.start_date ? settings.start_date.toISOString().split('T')[0] : null, // Convert Date to string format
        pace: settings.pace,
        budget: settings.budget,
        interests: settings.interests,
        transportation: settings.transportation,
        include_food: settings.include_food,
        user_id: user.id
      };

      // Sample activities (replace with actual API call)
      const sampleActivities = [
        { day: 1, time: '9:00 AM', title: 'Visit Gateway of India', location: 'Mumbai' },
        { day: 1, time: '1:00 PM', title: 'Lunch at a local restaurant', location: 'Mumbai' },
        { day: 2, time: '10:00 AM', title: 'Explore Elephanta Caves', location: 'Mumbai' },
      ];

      // Save itinerary to database
      const itineraryId = await saveItinerary(
        itinerarySettings,
        sampleActivities.map(activity => ({
          itinerary_id: '', // This will be populated by the hook
          day: activity.day,
          time: activity.time,
          title: activity.title,
          location: activity.location,
          description: 'A sample activity',
          image: null,
          category: 'sightseeing'
        }))
      );

      if (itineraryId) {
        navigate(`/itinerary/${itineraryId}`);
      } else {
        setError('Failed to save itinerary. Please try again.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-6">Plan Your Trip</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input
            type="text"
            name="title"
            id="title"
            value={settings.title}
            onChange={handleInputChange}
            placeholder="My Navi Mumbai Adventure"
          />
        </div>
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-gray-700">
            Number of Days
          </label>
          <Select value={String(settings.days)} onValueChange={(value) => handleSelectChange('days', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select number of days" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(day => (
                <SelectItem key={day} value={String(day)}>{day} Day(s)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !settings.start_date && "text-muted-foreground"
                )}
              >
                {settings.start_date ? (
                  format(settings.start_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={settings.start_date}
                onSelect={(date) => setSettings(prevSettings => ({
                  ...prevSettings,
                  start_date: date,
                }))}
                disabled={(date) =>
                  date < new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label htmlFor="pace" className="block text-sm font-medium text-gray-700">
            Pace
          </label>
          <Select value={settings.pace} onValueChange={(value) => handleSelectChange('pace', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select pace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relaxed">Relaxed</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="intensive">Intensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Budget
          </label>
          <Select value={settings.budget} onValueChange={(value) => handleSelectChange('budget', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {['Historical', 'Nature', 'Food', 'Shopping', 'Entertainment'].map(interest => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={`interest-${interest}`}
                  checked={settings.interests.includes(interest.toLowerCase())}
                  onCheckedChange={() => handleInterestChange(interest.toLowerCase())}
                />
                <label
                  htmlFor={`interest-${interest}`}
                  className="text-gray-700 text-sm"
                >
                  {interest}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="transportation" className="block text-sm font-medium text-gray-700">
            Transportation
          </label>
          <Select value={settings.transportation} onValueChange={(value) => handleSelectChange('transportation', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select transportation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="public">Public Transportation</SelectItem>
              <SelectItem value="walking">Walking</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include_food"
            checked={settings.include_food}
            onCheckedChange={handleCheckboxChange}
          />
          <label htmlFor="include_food" className="text-gray-700 text-sm">
            Include Food Recommendations
          </label>
        </div>
        <div>
          <Button onClick={handleGenerateItinerary} disabled={isGenerating} className="w-full">
            {isGenerating ? 'Generating...' : 'Generate Itinerary'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryGenerator;
