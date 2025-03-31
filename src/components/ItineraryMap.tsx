
import { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

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

interface ItineraryMapProps {
  itinerary: ItineraryDay[];
  isOpen: boolean;
  onClose: () => void;
}

type MapboxMap = any; // Simplify for this example, normally you'd import the proper type

const ItineraryMap = ({ itinerary, isOpen, onClose }: ItineraryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get all unique locations from itinerary
  const locations = itinerary.flatMap(day => 
    day.activities.map(activity => activity.location)
  ).filter((value, index, self) => self.indexOf(value) === index);
  
  // Initialize the map
  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current) return;

    const initMap = async () => {
      try {
        // Dynamic import of mapbox-gl
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        // Initialize Mapbox
        mapboxgl.default.accessToken = '562c360f0d7884a7ec779f34559a11fb'; // Using weather API key as placeholder
        
        setError(null);
        
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [73.0169, 19.0330], // Centered on Navi Mumbai
          zoom: 11
        });
        
        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
          setMapLoaded(true);
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Could not load the map. Please try again later.');
      }
    };

    initMap();
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isOpen]);
  
  // Add markers for each location when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    const addMarkers = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        
        // Create a bounds object to fit all markers
        const bounds = new mapboxgl.default.LngLatBounds();
        
        // Add markers for each location
        for (const day of itinerary) {
          for (const activity of day.activities) {
            // Use a simple geocoding approach for demo
            // In a real app, you would use a proper geocoding service
            const location = activity.location;
            
            // Get approximate coordinates for Navi Mumbai locations
            // This is a simplified approach - in production, use geocoding
            let coordinates: [number, number] = [73.0169, 19.0330]; // Default Navi Mumbai
            
            if (location.includes('Vashi')) {
              coordinates = [73.0071, 19.0754];
            } else if (location.includes('Belapur')) {
              coordinates = [73.0358, 19.0235];
            } else if (location.includes('Kharghar')) {
              coordinates = [73.0785, 19.0477];
            } else if (location.includes('Nerul')) {
              coordinates = [73.0157, 19.0377];
            } else if (location.includes('Panvel')) {
              coordinates = [73.1088, 18.9894];
            } else if (location.includes('Airoli')) {
              coordinates = [72.9985, 19.1557];
            } else if (location.includes('Ghansoli')) {
              coordinates = [73.0085, 19.1162];
            } else if (location.includes('Kopar Khairane')) {
              coordinates = [73.0071, 19.1050];
            } else if (location.includes('Sanpada')) {
              coordinates = [73.0119, 19.0506];
            } else if (location.includes('Turbhe')) {
              coordinates = [73.0224, 19.0897];
            } else if (location.includes('Ulwe')) {
              coordinates = [73.0454, 18.9775];
            }
            
            // Create a popup
            const popup = new mapboxgl.default.Popup({ offset: 25 })
              .setHTML(`
                <h3 class="font-medium">${activity.title}</h3>
                <p class="text-sm">${activity.time} - Day ${day.day}</p>
              `);
            
            // Create marker
            new mapboxgl.default.Marker({ color: '#0ea5e9' })
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current!);
              
            // Extend bounds to include this location
            bounds.extend(coordinates);
          }
        }
        
        // Fit the map to show all markers
        if (!bounds.isEmpty()) {
          map.current!.fitBounds(bounds, {
            padding: 50,
            maxZoom: 14
          });
        }
      } catch (err) {
        console.error('Error adding markers:', err);
        setError('Could not add location markers to the map.');
      }
    };
    
    addMarkers();
  }, [mapLoaded, itinerary]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapIcon className="h-5 w-5 mr-2" />
            Your Itinerary Map
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-[400px] relative mt-4 rounded-md overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-center p-4">
              <p className="text-destructive mb-2">{error}</p>
              <p className="text-sm text-muted-foreground">
                Consider installing <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Mapbox</a> for full mapping functionality.
              </p>
            </div>
          ) : (
            <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <div className="flex flex-col w-full gap-2">
            <div className="text-sm text-muted-foreground">
              Showing {locations.length} unique locations in your itinerary
            </div>
            <DialogClose asChild>
              <Button className="w-full">Close Map</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItineraryMap;
