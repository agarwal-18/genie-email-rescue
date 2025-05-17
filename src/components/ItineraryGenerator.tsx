
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { toast } from '@/hooks/use-toast';
import { useItinerary } from '@/hooks/useItinerary';
import { getAllRegions } from '@/lib/data';
import RegionSelector from '@/components/RegionSelector';
import { ItinerarySettings, ItineraryDayBase } from '@/config';

// Available interests for the itinerary
const interests = [
  { id: 'nature', label: 'Nature & Outdoors' },
  { id: 'history', label: 'History & Culture' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'food', label: 'Food & Cuisine' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'religious', label: 'Religious Sites' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'museums', label: 'Museums' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'wildlife', label: 'Wildlife' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'photography', label: 'Photography' }
];

// Define the form schema using zod
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(50),
  days: z.coerce.number().int().min(1).max(14),
  regions: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  pace: z.enum(['relaxed', 'moderate', 'intensive']),
  budget: z.enum(['budget', 'mid-range', 'luxury']),
  transportation: z.enum(['public', 'taxi', 'rental', 'walking']),
  interests: z.array(z.string()).nonempty('Select at least one interest'),
  includeFood: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// Add onGenerate prop to the component's props interface
interface ItineraryGeneratorProps {
  onGenerate?: (itinerary: ItineraryDayBase[], settings: ItinerarySettings) => void;
  initialData?: any;
}

const ItineraryGenerator = ({ onGenerate, initialData }: ItineraryGeneratorProps) => {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const { generateItinerary, isGenerating } = useItinerary();
  const regions = getAllRegions();

  const defaultValues: Partial<FormValues> = {
    title: initialData?.title || "My Maharashtra Trip",
    days: initialData?.days || 3,
    pace: initialData?.pace || "moderate",
    budget: initialData?.budget || "mid-range",
    transportation: initialData?.transportation || "public",
    interests: initialData?.interests || ["nature"],
    includeFood: initialData?.include_food !== undefined ? initialData.include_food : true,
    regions: initialData?.regions || [],
    locations: initialData?.locations || [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    if (selectedRegions.length === 0) {
      toast({
        title: "Region Selection Required",
        description: "Please select at least one region to explore",
        variant: "destructive",
      });
      return;
    }

    // Ensure title is always provided and not undefined
    const formData: ItinerarySettings = {
      title: data.title || "My Maharashtra Trip", // Provide default if missing
      days: data.days || 3, // Provide default if missing
      regions: selectedRegions,
      pace: data.pace || "moderate",
      budget: data.budget || "mid-range",
      transportation: data.transportation || "public",
      interests: data.interests || ["nature"],
      include_food: data.includeFood,
      locations: data.locations,
    };

    const itineraryData = await generateItinerary(formData);
    
    if (itineraryData && onGenerate) {
      onGenerate(itineraryData, formData);
    }
  };

  const handleAddRegion = (region: string) => {
    if (!region || selectedRegions.includes(region)) return;
    setSelectedRegions([...selectedRegions, region]);
    
    // Update the form value
    const currentRegions = form.getValues().regions || [];
    form.setValue('regions', [...currentRegions, region]);
  };

  const handleRemoveRegion = (region: string) => {
    setSelectedRegions(selectedRegions.filter((r) => r !== region));
    
    // Update the form value
    const currentRegions = form.getValues().regions || [];
    form.setValue('regions', currentRegions.filter((r) => r !== region));
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Itinerary Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Maharashtra Adventure" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="14"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="regions"
                render={() => (
                  <FormItem>
                    <FormLabel>Regions to Explore</FormLabel>
                    <div className="flex gap-2">
                      <Select 
                        onValueChange={handleAddRegion}
                        value=""
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Add regions" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem 
                              key={region} 
                              value={region}
                              disabled={selectedRegions.includes(region)}
                            >
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Selected regions display */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedRegions.length === 0 && (
                        <p className="text-sm text-muted-foreground">No regions selected</p>
                      )}
                      
                      {selectedRegions.map((region) => (
                        <Badge 
                          key={region} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveRegion(region)}
                        >
                          {region} ✕
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="pace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Pace</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="intensive">Intensive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How many activities you want per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="budget">Budget-friendly</SelectItem>
                        <SelectItem value="mid-range">Mid-range</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your preferred spending level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="transportation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportation</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transportation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public Transport</SelectItem>
                        <SelectItem value="taxi">Taxi/Cab</SelectItem>
                        <SelectItem value="rental">Car Rental</SelectItem>
                        <SelectItem value="walking">Walking/Cycling</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How you plan to get around
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <FormLabel>Interests</FormLabel>
                  <FormDescription>
                    Select activities that interest you for this trip
                  </FormDescription>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {interests.map((interest) => (
                      <FormField
                        key={interest.id}
                        control={form.control}
                        name="interests"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={interest.id}
                              className="flex flex-row items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(interest.id)}
                                  onCheckedChange={(checked) => {
                                    const currentVal = field.value || [];
                                    return checked
                                      ? field.onChange([...currentVal, interest.id])
                                      : field.onChange(
                                          currentVal.filter((val) => val !== interest.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {interest.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="includeFood"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Food Recommendations</FormLabel>
                    <FormDescription>
                      Add restaurant suggestions based on your locations and budget
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Creating Your Itinerary
                </>
              ) : (
                'Generate Itinerary'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ItineraryGenerator;
