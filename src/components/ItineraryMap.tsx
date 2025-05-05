
import { useEffect, useRef, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { API_CONFIG } from '@/config';
import { toast } from 'sonner';

// Declare Leaflet types globally
declare global {
  interface Window {
    L: {
      map: (container: HTMLElement, options?: any) => any;
      tileLayer: (url: string, options?: any) => any;
      latLngBounds: () => any;
      marker: (latlng: [number, number], options?: any) => any;
      divIcon: (options: any) => any;
    }
  }
}

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
  const leafletLoaded = useRef(false);
  const markersRef = useRef<any[]>([]);
  const initAttempts = useRef(0);
  
  // Get all unique locations from itinerary
  const locations = itinerary.flatMap(day => 
    day.activities.map(activity => activity.location)
  ).filter((value, index, self) => self.indexOf(value) === index);

  console.log("All extracted locations:", locations);

  // Navi Mumbai locations with coordinates (extended list)
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
    'Central Park': [73.0785, 19.0477],
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
    'Dr. Ambedkar Memorial': [72.9985, 19.1557],
    'Raghuleela Mall': [73.0077, 19.0720],
    'Belapur Fort': [73.0358, 19.0235],
    'Navi Mumbai': [73.0401, 19.0185],
    'Shivaji Park': [73.0325, 19.0279],
    'DLF Mall': [73.0140, 19.0446],
    'Mindspace': [73.0238, 19.0556],
    'CBD Belapur': [73.0358, 19.0235],
    'Utsav Chowk': [73.0790, 19.0494],
    'Kharghar Valley': [73.0783, 19.0434],
    'Kharghar Hills': [73.0753, 19.0370],
    'Central Avenue': [73.0141, 19.0353],
    'Tata Hospital': [73.0799, 19.0307],
    'Nerul Lake': [73.0163, 19.0326],
    'Seawoods Grand Central': [73.0180, 19.0131],
    'Pandavkada Falls': [73.0825, 19.0345],
    'Little World Mall': [73.0187, 19.0421],
    'Vashi Lake': [73.0042, 19.0701],
    'Mango Garden': [73.0358, 19.0235],
    'Science Centre': [73.0154, 19.0377],
    'Navi Mumbai Municipal Corporation': [73.0175, 19.0334],
    'Vashi Railway Station': [73.0066, 19.0760],
    'Kharghar Railway Station': [73.0798, 19.0422],
    'Nerul Railway Station': [73.0162, 19.0375],
    'Belapur Railway Station': [73.0340, 19.0243],
    'Tikuji-Ni-Wadi': [73.1025, 19.2052],
    'Karnala Bird Sanctuary': [73.1242, 18.8891],
    'Kharghar Hills and Golf Course': [73.0753, 19.0370],
    'DPS Lake': [73.0776, 19.0299],
    'Dolphin Aquatic Complex': [73.0152, 19.0304],
    'Shri Sai Baba Mandir': [73.0100, 19.0730],
    'ISKCON Temple': [73.0176, 19.0332],
    'Central Park Kharghar': [73.0790, 19.0440],
    'Shilp Garden': [73.0339, 19.0240],
    'Nerul Sea Beach': [73.0070, 19.0150],
    'TS Chanakya': [73.0210, 19.0238],
    'Seawoods Lake': [73.0167, 19.0148],
    'Vashi Mini Seashore': [73.0080, 19.0633],
    'Botanical Gardens': [73.0783, 19.0434],
    'Talawe Wetlands': [73.0165, 19.0380],
    'Wonder Park Nerul': [73.0114, 19.0380],
    'CIDCO Exhibition Centre': [73.0141, 19.0353],
    'Ambrosia Water Park': [73.0548, 19.0031],
    'Central Park Belapur': [73.0358, 19.0235],
    'Seawoods Grand Central Mall': [73.0180, 19.0131]
  };
  
  const leafletCssId = 'leaflet-css';
  const leafletJsId = 'leaflet-js';
  
  // Load Leaflet CSS and JS once
  useEffect(() => {
    if (leafletLoaded.current) return;

    // Load Leaflet CSS if not already loaded
    const loadCSS = () => {
      if (!document.getElementById(leafletCssId)) {
        const link = document.createElement('link');
        link.id = leafletCssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
    };

    // Load Leaflet script if not already loaded
    const loadScript = async () => {
      if (!window.L) {
        return new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.id = leafletJsId;
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.onload = () => {
            leafletLoaded.current = true;
            resolve();
          };
          document.head.appendChild(script);
        });
      }
      return Promise.resolve();
    };

    loadCSS();
    loadScript();
  }, []);
  
  // Cleanup map when component unmounts
  useEffect(() => {
    return () => {
      clearMapResources();
    };
  }, []);
  
  // Clean up map resources
  const clearMapResources = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
    markersRef.current = [];

    // Remove map
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
  };

  // Enhanced helper function for fuzzy location matching
  const findBestLocationMatch = (locationName: string): [number, number] | null => {
    console.log("Finding location match for:", locationName);
    
    // Strategy 1: Direct exact match
    if (locationCoordinates[locationName]) {
      console.log(`Found direct match for ${locationName}`);
      return locationCoordinates[locationName];
    }
    
    // Strategy 2: Case-insensitive exact match
    const lowerLocationName = locationName.toLowerCase();
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (key.toLowerCase() === lowerLocationName) {
        console.log(`Found case-insensitive match for ${locationName}: ${key}`);
        return coords;
      }
    }
    
    // Strategy 3: Check if the location contains any of our known locations
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (locationName.toLowerCase().includes(key.toLowerCase())) {
        console.log(`Found partial match (location contains key) for ${locationName}: ${key}`);
        return coords;
      }
    }
    
    // Strategy 4: Check if any of our known locations contain this location
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (key.toLowerCase().includes(locationName.toLowerCase()) && locationName.length > 3) {
        console.log(`Found partial match (key contains location) for ${locationName}: ${key}`);
        return coords;
      }
    }
    
    // Strategy 5: Word-by-word matching (any significant word match)
    const locationWords = locationName.toLowerCase().split(/\s+/);
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      const keyWords = key.toLowerCase().split(/\s+/);
      // Check if any word in the location matches any word in the key
      const hasCommonWord = locationWords.some(word => 
        keyWords.some(keyWord => keyWord === word && word.length > 2)
      );
      
      if (hasCommonWord) {
        console.log(`Found word match for ${locationName}: ${key}`);
        return coords;
      }
    }

    // Strategy 6: Try to extract any known location from the name
    // For text like "Visit XYZ in Kharghar", we want to extract "Kharghar"
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (locationName.toLowerCase().includes("in " + key.toLowerCase()) ||
          locationName.toLowerCase().includes("at " + key.toLowerCase()) ||
          locationName.toLowerCase().includes("near " + key.toLowerCase())) {
        console.log(`Found location by preposition extraction for ${locationName}: ${key}`);
        return coords;
      }
    }
    
    console.log(`No match found for ${locationName}`);
    return null;
  };
  
  // Initialize the map when dialog is opened and Leaflet is loaded
  useEffect(() => {
    // Reset state when dialog closes
    if (!isOpen) {
      clearMapResources();
      setMapLoaded(false);
      setError(null);
      initAttempts.current = 0;
      return;
    }
    
    // Clear previous error
    setError(null);
    setMapLoaded(false);
    
    // Function to initialize map once Leaflet is loaded
    const initializeMap = () => {
      // Check if the map container exists
      if (!mapContainer.current) {
        console.error("Map container not found");
        if (initAttempts.current < 3) {
          initAttempts.current += 1;
          // Try again after a short delay
          setTimeout(initializeMap, 300);
          return;
        }
        setError("Map container not found");
        return;
      }
      
      // Clean up existing map resources
      clearMapResources();
      
      try {
        console.log("Initializing map...");
        
        // Check if Leaflet is loaded
        if (!window.L) {
          console.log("Leaflet not yet loaded, delaying map initialization");
          if (initAttempts.current < 3) {
            initAttempts.current += 1;
            // Try again after a short delay
            setTimeout(initializeMap, 300);
          } else {
            setError("Map library failed to load");
          }
          return;
        }
        
        // Create bounds object
        const bounds = window.L.latLngBounds();
        let hasValidLocations = false;
        
        // Create map instance centered on Navi Mumbai
        const map = window.L.map(mapContainer.current).setView(
          API_CONFIG.defaultMapCenter, 
          API_CONFIG.defaultMapZoom
        );
        
        // Store the map instance for cleanup
        mapInstance.current = map;
        
        // Add OpenStreetMap tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        console.log("Map created with tile layer");
        
        // Properly invalidate the map size after render
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 100);
        
        // Gather all activities from itinerary
        const allActivities: Array<{activity: ItineraryActivity, day: number}> = [];
        itinerary.forEach(day => {
          day.activities.forEach(activity => {
            allActivities.push({activity, day: day.day});
          });
        });
        
        console.log(`Found ${allActivities.length} activities in itinerary`);
        
        // Add markers for each activity location
        const markers: any[] = [];
        const dayColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        const locationTracker = new Map<string, number[]>();
        
        // Debug: Log all locations that will be plotted
        console.log("Locations to plot on map:", allActivities.map(({activity}) => activity.location));
        
        // Process all activities from all days in the itinerary
        allActivities.forEach(({activity, day}) => {
          const dayColor = dayColors[(day - 1) % dayColors.length];
          
          // Get the location name
          const locationName = activity.location.trim();
          
          // Generate a unique key that combines location and day
          const locationDayKey = `${locationName}-day${day}`;
          
          // Skip if we've already processed this exact location-day combination
          if (locationTracker.has(locationDayKey)) {
            console.log(`Already added marker for ${locationName} on day ${day}`);
            return;
          }
          
          // Find coordinates for this location
          let coordinates = findBestLocationMatch(locationName);
          
          // If no coordinates found, try with just the main city/area names that might appear in the location
          if (!coordinates) {
            // Try to extract just the area name that might be in the location string
            const locationLower = locationName.toLowerCase();
            const extractedLocation = Object.keys(locationCoordinates).find(key => 
              locationLower.includes(key.toLowerCase())
            );
            
            if (extractedLocation) {
              console.log(`Using extracted location ${extractedLocation} from ${locationName}`);
              coordinates = locationCoordinates[extractedLocation];
            }
          }
          
          // If still no coordinates, use a close approximation or the Navi Mumbai center
          if (!coordinates) {
            console.log(`No coordinates found for ${locationName}, using fallback`);
            
            // Use a random offset from center for visual separation
            const randomOffset = () => (Math.random() - 0.5) * 0.02;
            coordinates = [
              API_CONFIG.defaultMapCenter[0] + randomOffset(), 
              API_CONFIG.defaultMapCenter[1] + randomOffset()
            ];
          }
          
          // Mark this location-day combo as processed
          locationTracker.set(locationDayKey, [coordinates[1], coordinates[0]]);
          
          // Create marker with custom icon
          const markerIcon = window.L.divIcon({
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
            ">${day}</div>`,
            iconSize: [24, 24],
            className: 'custom-div-icon'
          });
          
          console.log(`Adding marker for ${locationName} at [${coordinates[1]}, ${coordinates[0]}] for day ${day}`);
          
          // Create marker with popup
          const marker = window.L.marker([coordinates[1], coordinates[0]], { icon: markerIcon })
            .bindPopup(`
              <div style="padding: 10px;">
                <h3 style="font-weight: bold;">${activity.title}</h3>
                <p style="font-size: 12px; color: #666;">${activity.time} - Day ${day}</p>
                <p style="font-size: 12px;">${activity.location}</p>
                <p style="font-size: 12px;">${activity.description || ''}</p>
              </div>
            `);
          
          marker.addTo(map);
          markers.push(marker);
          markersRef.current.push(marker);
          
          // Add to bounds for auto-zooming
          bounds.extend([coordinates[1], coordinates[0]]);
          hasValidLocations = true;
        });
        
        console.log(`Added ${markers.length} markers to map`);
        console.log(`Tracked ${locationTracker.size} unique location-day combinations`);
        
        // Fit the map to show all markers
        if (markers.length > 0 && hasValidLocations) {
          console.log("Fitting map to bounds");
          map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 13
          });
        } else {
          console.warn("No valid markers to display on map");
          toast.warning("Couldn't locate some places on the map");
        }
        
        setMapLoaded(true);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(`Could not load the map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    // Set a timeout to ensure the dialog is fully rendered
    const timeoutId = setTimeout(() => {
      initializeMap();
    }, 200);
    
    // Clear the timeout on cleanup
    return () => clearTimeout(timeoutId);
  }, [isOpen, itinerary]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapIcon className="h-5 w-5 mr-2" />
            Your Itinerary Map
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-[500px] relative mt-4 rounded-md overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-center p-4">
              <p className="text-destructive mb-2">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">
                We're having trouble loading the map. Please try again later.
              </p>
            </div>
          ) : !mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            </div>
          ) : null}
          <div ref={mapContainer} className="absolute inset-0 rounded-lg border" />
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
