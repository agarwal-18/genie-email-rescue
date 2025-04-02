import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Calendar, Map, Menu, Copy, Share2, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ItineraryGenerator from '@/components/ItineraryGenerator';
import TripTips from '@/components/TripTips';
import Weather from '@/components/Weather';
import ItineraryMap from '@/components/ItineraryMap';

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

// Sample location images for different parts of Navi Mumbai
const locationImages: Record<string, string> = {
  'Vashi': 'https://images.unsplash.com/photo-1600596763590-bcb204490b8c?q=80&w=800',
  'Belapur': 'https://images.unsplash.com/photo-1600596763590-bcb204490b8c?q=80&w=800',
  'Kharghar': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800',
  'Nerul': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800',
  'Panvel': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800',
  'Airoli': 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=800',
  'Ghansoli': 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=800',
  'Kopar Khairane': 'https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=800',
  'Sanpada': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800',
  'Turbhe': 'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?q=80&w=800',
  'Seawoods': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800',
  'DY Patil Stadium': 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?q=80&w=800',
  'Central Park': 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=800',
  'Inorbit Mall': 'https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=800',
  'Wonder Park': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800',
  'Mini Seashore': 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800',
  'Akshar Dhaam': 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=800',
  'Wonders Park': 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=800',
  'APMC Market': 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800',
  'Parsik Hill': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800',
  'Palm Beach Road': 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800',
  'Jewel of Navi Mumbai': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800',
  'Sagar Vihar': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800',
  'Golf Course': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800'
};

// Default image if location doesn't have a specific one
const defaultImages = [
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=800',
  'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?q=80&w=800',
  'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800',
  'https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=800',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=800'
];

const Itinerary = () => {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Vashi']);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Helper function to get an image for a location
  const getImageForLocation = (location: string): string => {
    // If the location already has an image in our mapping, use that
    if (locationImages[location]) {
      return locationImages[location];
    }
    
    // Otherwise, try to find any partial match
    const partialMatch = Object.keys(locationImages).find(
      key => location.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(location.toLowerCase())
    );
    
    if (partialMatch) {
      return locationImages[partialMatch];
    }
    
    // If no match, return a random default image
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  };

  const handleGenerateItinerary = (newItinerary: ItineraryDay[]) => {
    console.log("New itinerary generated:", newItinerary);

    // Extract unique locations from the itinerary activities
    const locations = new Set<string>();
    newItinerary.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.location) {
          locations.add(activity.location);
          console.log(`Added location: ${activity.location}`);
        }
      });
    });

    const locationArray = Array.from(locations);
    console.log("Extracted locations:", locationArray);
    setSelectedLocations(locationArray);

    // Add images to activities
    const itineraryWithImages = newItinerary.map(day => ({
      ...day,
      activities: day.activities.map(activity => ({
        ...activity,
        image: activity.image || getImageForLocation(activity.location)
      }))
    }));

    setItinerary(itineraryWithImages);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(err => console.error('Failed to copy URL', err));
    
    toast({
      title: "Share link copied",
      description: "The link to your itinerary has been copied to clipboard.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: "Itinerary downloaded",
      description: "Your itinerary has been downloaded as a PDF.",
    });
  };

  const handleOpenMap = () => {
    if (itinerary.length > 0) {
      console.log("Opening map with itinerary:", itinerary);
      console.log("Locations for map:", selectedLocations);
      setIsMapOpen(true);
    } else {
      toast({
        title: "No itinerary created",
        description: "Generate an itinerary first to view it on the map.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-4xl font-bold">Itinerary Planner</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Create your perfect Navi Mumbai exploration plan in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-12 gap-8">
            {/* Itinerary Generator */}
            <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-24 h-fit">
              <ItineraryGenerator onGenerate={handleGenerateItinerary} />
              
              {/* Weather Widget */}
              {selectedLocations.length > 0 && (
                <div className="mt-4">
                  <Weather location={selectedLocations[0]} />
                </div>
              )}
              
              {/* Trip Tips */}
              {itinerary.length > 0 && (
                <div className="mt-4">
                  <TripTips locations={selectedLocations} />
                </div>
              )}
            </div>
            
            {/* Itinerary Display */}
            <div className="md:col-span-7 lg:col-span-8">
              {itinerary.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Your Itinerary</h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Menu className="h-4 w-4 mr-2" />
                          <span>Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleShare}>
                          <Share2 className="h-4 w-4 mr-2" />
                          <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-2" />
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handlePrint}>
                          <Printer className="h-4 w-4 mr-2" />
                          <span>Print</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Card className="border-none shadow-md">
                    <CardHeader className="px-4 py-3 border-b">
                      <Tabs defaultValue={`day-${itinerary[0].day}`}>
                        <TabsList className="grid grid-flow-col auto-cols-fr">
                          {itinerary.map((day) => (
                            <TabsTrigger key={day.day} value={`day-${day.day}`}>
                              Day {day.day}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {itinerary.map((day) => (
                          <TabsContent key={day.day} value={`day-${day.day}`} className="mt-4">
                            <CardTitle className="flex items-center text-lg">
                              <Calendar className="h-5 w-5 mr-2 text-primary" />
                              <span>Day {day.day} Schedule</span>
                            </CardTitle>
                            
                            <CardContent className="px-0 py-4">
                              <div className="space-y-6">
                                {day.activities.map((activity, index) => (
                                  <div key={index} className="relative pl-6 pb-6">
                                    {/* Timeline connector */}
                                    {index < day.activities.length - 1 && (
                                      <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-primary/20"></div>
                                    )}
                                    
                                    {/* Time marker */}
                                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    </div>
                                    
                                    <div className="ml-4">
                                      <div className="flex justify-between items-start">
                                        <h3 className="font-medium">{activity.title}</h3>
                                        <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                          {activity.time}
                                        </span>
                                      </div>
                                      
                                      <div className="mt-1 flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span>{activity.location}</span>
                                      </div>
                                      
                                      <p className="mt-2 text-sm text-muted-foreground">
                                        {activity.description}
                                      </p>
                                      
                                      {/* Always display an image */}
                                      <div className="mt-3 rounded-lg overflow-hidden h-40">
                                        <img 
                                          src={activity.image || getImageForLocation(activity.location)} 
                                          alt={activity.title}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            // If image fails to load, use a default one
                                            console.log(`Image failed to load for ${activity.location}, using fallback`);
                                            e.currentTarget.src = defaultImages[0];
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardHeader>
                  </Card>
                  
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={handleOpenMap}>
                      <Map className="h-4 w-4 mr-2" />
                      <span>View on Map</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setItinerary([])}>
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Reset Planner</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-xl p-10 text-center h-96 flex flex-col items-center justify-center">
                  <Map className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Itinerary Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {user ? 
                      "Use the itinerary generator to create your personalized Navi Mumbai exploration plan." : 
                      "Sign in to create and save your personalized Navi Mumbai exploration plans."}
                  </p>
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center bg-primary/10 text-primary w-6 h-6 rounded-full text-xs mr-3">1</span>
                      <span>Select your preferences and number of days</span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center justify-center bg-primary/10 text-primary w-6 h-6 rounded-full text-xs mr-3">2</span>
                      <span>Choose your interests and budget</span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center justify-center bg-primary/10 text-primary w-6 h-6 rounded-full text-xs mr-3">3</span>
                      <span>Generate your custom itinerary</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Dialog */}
      {itinerary.length > 0 && (
        <ItineraryMap 
          itinerary={itinerary} 
          isOpen={isMapOpen} 
          onClose={() => setIsMapOpen(false)} 
        />
      )}
    </div>
  );
};

export default Itinerary;
