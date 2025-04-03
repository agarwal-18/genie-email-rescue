
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
  
  // Initialize the map when the dialog is opened
  useEffect(() => {
    if (!isOpen || !mapContainer.current) {
      return;
    }
    
    // Don't reinitialize if map already loaded
    if (mapLoaded) {
      return;
    }
    
    const initMap = async () => {
      try {
        // Set up map container dimensions
        if (mapContainer.current) {
          mapContainer.current.style.width = '100%';
          mapContainer.current.style.height = '400px';
          mapContainer.current.style.zIndex = '10';
          mapContainer.current.innerHTML = '';
        }
        
        // Load required libraries
        const [L] = await Promise.all([
          import('leaflet').then(module => module.default),
          import('leaflet/dist/leaflet.css')
        ]);
        
        // Create map instance
        const map = L.map(mapContainer.current!).setView([19.0330, 73.0169], 12);
        
        // Add OpenStreetMap layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add markers for each location
        let markers = L.featureGroup();
        const dayColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        
        // Process activities and add markers
        for (const day of itinerary) {
          const dayColor = dayColors[(day.day - 1) % dayColors.length];
          
          for (const activity of day.activities) {
            // Get coordinates for the location
            let coordinates: [number, number] | null = null;
            
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
            
            if (!coordinates) {
              continue;
            }
            
            // Create custom marker icon
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
            
            markers.addLayer(marker);
          }
        }
        
        // Add all markers to map
        if (markers.getLayers().length > 0) {
          markers.addTo(map);
          map.fitBounds(markers.getBounds(), { padding: [30, 30] });
        }
        
        setMapLoaded(true);
        setError(null);
        
        // Clean up function
        return () => {
          map.remove();
          setMapLoaded(false);
        };
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(`Could not load the map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    // Initialize map with a small delay to ensure the container is fully rendered
    const timeoutId = setTimeout(() => {
      initMap();
    }, 500);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen, itinerary, locations]);

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
