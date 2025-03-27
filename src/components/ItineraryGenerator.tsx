
import { useState } from 'react';
import { Calendar, Clock, Filter, ListFilter, CheckCircle, ChevronsUpDown, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { generateItinerary } from '@/lib/data';

interface ItineraryDay {
  day: number;
  activities: {
    time: string;
    title: string;
    location: string;
    description: string;
    image?: string;
    category: string;
  }[];
}

interface ItineraryGeneratorProps {
  onGenerate?: (itinerary: ItineraryDay[]) => void;
}

const ItineraryGenerator = ({ onGenerate }: ItineraryGeneratorProps) => {
  const [days, setDays] = useState(2);
  const [paceValue, setPaceValue] = useState(50);
  const [budget, setBudget] = useState('medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [transportation, setTransportation] = useState('public');
  const [includeFood, setIncludeFood] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const interestOptions = [
    'Nature', 'Museums', 'Shopping', 'Adventure', 
    'History', 'Parks', 'Food', 'Temples', 'Art',
    'Local Markets', 'Architecture'
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleGenerate = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const pace = paceValue < 33 ? 'relaxed' : paceValue < 66 ? 'moderate' : 'active';
      
      const itinerary = generateItinerary({
        days,
        pace,
        budget,
        interests,
        includeFood,
        transportation
      });
      
      if (onGenerate) {
        onGenerate(itinerary);
      }
      
      setLoading(false);
      setGenerated(true);
    }, 1500);
  };

  return (
    <Card className="w-full overflow-hidden border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-navi-blue to-navi-teal text-white">
        <div className="flex items-center">
          <Map className="mr-2 h-5 w-5" />
          <CardTitle>Itinerary Planner</CardTitle>
        </div>
        <CardDescription className="text-white/80">
          Tell us your preferences, and we'll create the perfect Navi Mumbai itinerary for you
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-6">
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="dates">Start Date</Label>
            <div className="relative">
              <Input
                id="dates"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Label htmlFor="days">Number of Days</Label>
              <span className="text-sm font-medium">{days} days</span>
            </div>
            <Slider
              id="days"
              min={1}
              max={7}
              step={1}
              value={[days]}
              onValueChange={(value) => setDays(value[0])}
            />
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="preferences">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>Preferences</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 py-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Pace</Label>
                    <span className="text-xs">
                      {paceValue < 33 ? 'Relaxed' : paceValue < 66 ? 'Moderate' : 'Active'}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[paceValue]}
                    onValueChange={(value) => setPaceValue(value[0])}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger id="budget">
                      <SelectValue placeholder="Choose your budget" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="budget">Budget-friendly</SelectItem>
                      <SelectItem value="medium">Mid-range</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="transport">Transportation</Label>
                  <Select value={transportation} onValueChange={setTransportation}>
                    <SelectTrigger id="transport">
                      <SelectValue placeholder="Choose transportation" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="public">Public Transport</SelectItem>
                      <SelectItem value="taxi">Taxi/Cab</SelectItem>
                      <SelectItem value="car">Private Car</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-food" 
                    checked={includeFood}
                    onCheckedChange={setIncludeFood}
                  />
                  <Label htmlFor="include-food">Include food recommendations</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="interests">
            <AccordionTrigger className="font-medium">
              <div className="flex items-center">
                <ListFilter className="mr-2 h-4 w-4" />
                <span>Interests</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3">
                {interestOptions.map((interest) => (
                  <Button
                    key={interest}
                    type="button"
                    variant={interests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleInterest(interest)}
                    className="justify-start"
                  >
                    {interests.includes(interest) && (
                      <CheckCircle className="mr-2 h-3 w-3" />
                    )}
                    <span className="text-xs">{interest}</span>
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="bg-muted/30 px-6 py-4">
        <Button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : generated ? (
            <>
              <ChevronsUpDown className="mr-2 h-4 w-4" />
              <span>Update Itinerary</span>
            </>
          ) : (
            <>
              <Map className="mr-2 h-4 w-4" />
              <span>Generate Itinerary</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItineraryGenerator;
