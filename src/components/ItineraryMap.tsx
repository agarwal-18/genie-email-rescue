
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

const ItineraryMap = ({ itinerary, isOpen, onClose }: ItineraryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get all unique locations from itinerary
  const locations = itinerary.flatMap(day => 
    day.activities.map(activity => activity.location)
  ).filter((value, index, self) => self.indexOf(value) === index);

  // Navi Mumbai locations with coordinates
  const locationCoordinates: Record<string, [number, number]> = {
    'Vashi': [73.0071, 19.0754],
    'Belapur': [73.0358, 19.0235],
    'Kharghar': [73.0785, 19.0477],
    'Nerul': [73.0157, 19.0377],
    'Panvel': [73.1088, 18.9894],
    'Airoli': [72.9985, 19.1557],
    'Ghansoli': [73.0085, 19.1162],
    'Kopar Khairane': [73.0071, 19.1050],
    'Sanpada': [73.0119, 19.0506],
    'Turbhe': [73.0224, 19.0897],
    'Seawoods': [73.0185, 19.0142],
    'DY Patil Stadium': [73.0282, 19.0446],
    'Central Park': [73.0169, 19.0343],
    'Inorbit Mall': [73.0169, 19.0343],
    'Wonder Park': [73.0074, 19.0137],
    'Mini Seashore': [73.0215, 19.0240],
    'Akshar Dhaam': [72.9962, 19.1030],
    'Wonders Park': [73.0074, 19.0137],
    'APMC Market': [73.0166, 19.0680],
    'Parsik Hill': [73.0299, 19.0303],
    'Palm Beach Road': [73.0222, 19.0037],
    'Jewel of Navi Mumbai': [73.0173, 19.0340],
    'Sagar Vihar': [73.0083, 19.0633],
    'Golf Course': [73.0081, 19.0157],
    'Nerul Balaji Temple': [73.0206, 19.0377],
    'Flamingo Sanctuary': [73.0165, 19.0380],
    'Science Centre': [73.0174, 19.0390],
    'Raghuleela Mall': [73.0077, 19.0720],
    'Belapur Fort': [73.0358, 19.0235]
  };
  
  // Cleanup function for map
  const cleanupMap = () => {
    if (mapInstance.current) {
      console.log("Cleaning up existing map");
      mapInstance.current.remove();
      mapInstance.current = null;
    }
  };
  
  // Effect to load and clean up the map
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);
  
  // Initialize the map when the dialog is opened
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
    // Ensure clean start
    cleanupMap();
    setMapLoaded(false);
    setError(null);
    
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }
    
    // Clear previous content
    mapContainer.current.innerHTML = '';
    
    // Set up map container dimensions
    mapContainer.current.style.width = '100%';
    mapContainer.current.style.height = '400px';
    
    const initMap = async () => {
      try {
        console.log("Initializing map...");
        
        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        
        // Load Leaflet script if it's not already loaded
        let L: any;
        if (!window.L) {
          await new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            document.head.appendChild(script);
          });
          L = window.L;
        } else {
          L = window.L;
        }
        
        // Ensure Leaflet is loaded before proceeding
        if (!L) {
          throw new Error("Failed to load Leaflet library");
        }
        
        console.log("Leaflet loaded successfully");
        
        // Create map instance - default to Navi Mumbai center
        const map = L.map(mapContainer.current, {
          center: [19.0330, 73.0169], // Navi Mumbai coordinates
          zoom: 12,
        });
        
        // Store the map instance for cleanup
        mapInstance.current = map;
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        console.log("Map created with tile layer");
        
        // Add markers for each location
        const markers: any[] = [];
        const dayColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        
        console.log("Processing itinerary with", itinerary.length, "days");
        
        // Process activities and add markers
        itinerary.forEach(day => {
          const dayColor = dayColors[(day.day - 1) % dayColors.length];
          
          day.activities.forEach(activity => {
            // Get coordinates for the location
            let coordinates: [number, number] | undefined;
            
            // Look for exact location match first
            if (locationCoordinates[activity.location]) {
              coordinates = locationCoordinates[activity.location];
            } else {
              // Try partial matching
              const locationKey = Object.keys(locationCoordinates).find(
                key => activity.location.toLowerCase().includes(key.toLowerCase()) || 
                      key.toLowerCase().includes(activity.location.toLowerCase())
              );
              
              if (locationKey) {
                coordinates = locationCoordinates[locationKey];
              } else {
                // Fallback to Navi Mumbai central coordinates with a small random offset
                const randomOffset = () => (Math.random() - 0.5) * 0.02; // Small random offset
                coordinates = [73.0169 + randomOffset(), 19.0330 + randomOffset()];
              }
            }
            
            if (!coordinates) return;
            
            console.log(`Adding marker for ${activity.title} at [${coordinates[1]}, ${coordinates[0]}]`);
            
            // Create marker with custom icon
            const markerIcon = L.divIcon({
              html: `<div style="
                background-color: ${dayColor}; 
                width: 24px; 
                height: 24px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
              ">${day.day}</div>`,
              iconSize: [24, 24],
              className: 'custom-div-icon'
            });
            
            // Create marker with popup
            const marker = L.marker([coordinates[1], coordinates[0]], { icon: markerIcon })
              .bindPopup(`
                <div style="padding: 10px;">
                  <h3 style="font-weight: bold;">${activity.title}</h3>
                  <p style="font-size: 12px; color: #666;">${activity.time} - Day ${day.day}</p>
                  <p style="font-size: 12px;">${activity.location}</p>
                </div>
              `);
            
            marker.addTo(map);
            markers.push(marker);
          });
        });
        
        console.log("Added", markers.length, "markers to map");
        
        // If we have markers, fit the map to show all of them
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds(), {
            padding: [30, 30]
          });
        }
        
        setMapLoaded(true);
        setError(null);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(`Could not load the map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    // Initialize map with a small delay to ensure the container is fully rendered
    const timeoutId = setTimeout(() => {
      initMap();
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, itinerary, locations]);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isOpen) {
      cleanupMap();
    }
  }, [isOpen]);

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
              <p className="text-sm text-muted-foreground mb-4">
                We're having trouble loading the map. Please try again later.
              </p>
            </div>
          ) : (
            <div ref={mapContainer} className="absolute inset-0 rounded-lg border" />
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
