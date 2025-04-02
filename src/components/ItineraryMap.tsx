import { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,,
  DialogContent,ontent,
  DialogHeader,
  DialogTitle,
  DialogFooter,,
  DialogClose
} from '@/components/ui/dialog';ponents/ui/dialog';

interface ItineraryActivity {interface ItineraryActivity {
  time: string;
  title: string;;
  location: string;ng;
  description: string;ng;
  image?: string;
  category: string;g;
}

interface ItineraryDay {interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];ItineraryActivity[];
}

interface ItineraryMapProps {interface ItineraryMapProps {
  itinerary: ItineraryDay[];
  isOpen: boolean;
  onClose: () => void;oid;
}

type MapboxMap = any; // Simplify for this example, normally you'd import the proper typetype MapboxMap = any; // Simplify for this example, normally you'd import the proper type

const ItineraryMap = ({ itinerary, isOpen, onClose }: ItineraryMapProps) => {const ItineraryMap = ({ itinerary, isOpen, onClose }: ItineraryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);false);
  const [error, setError] = useState<string | null>(null);null);
  const [mapboxAPIKey, setMapboxAPIKey] = useState<string>(() => {(() => {
    return localStorage.getItem('mapboxAPIKey') || '';
  });
  
  // Get all unique locations from itinerary// Get all unique locations from itinerary
  const locations = itinerary.flatMap(day =>  
    day.activities.map(activity => activity.location)ocation)
  ).filter((value, index, self) => self.indexOf(value) === index);) === index);

  // Navi Mumbai locations with coordinates  // Navi Mumbai locations with coordinates
  const locationCoordinates: Record<string, [number, number]> = { [number, number]> = {
    'Vashi': [73.0071, 19.0754],
    'Belapur': [73.0358, 19.0235],],
    'Kharghar': [73.0785, 19.0477],,
    'Nerul': [73.0157, 19.0377],
    'Panvel': [73.1088, 18.9894],,
    'Airoli': [72.9985, 19.1557],
    'Ghansoli': [73.0085, 19.1162],],
    'Kopar Khairane': [73.0071, 19.1050],1050],
    'Sanpada': [73.0119, 19.0506],
    'Turbhe': [73.0224, 19.0897],
    'Seawoods': [73.0185, 19.0142],],
    'DY Patil Stadium': [73.0282, 19.0446],9.0446],
    'Central Park': [73.0169, 19.0343],
    'Inorbit Mall': [73.0169, 19.0343],
    'Wonder Park': [73.0074, 19.0137],
    'Mini Seashore': [73.0215, 19.0240],],
    'Akshar Dhaam': [72.9962, 19.1030],
    'Wonders Park': [73.0074, 19.0137],
    'APMC Market': [73.0166, 19.0680],
    'Parsik Hill': [73.0299, 19.0303],
    'Palm Beach Road': [73.0222, 19.0037],37],
    'Jewel of Navi Mumbai': [73.0173, 19.0340],340],
    'Sagar Vihar': [73.0083, 19.0633],
    'Golf Course': [73.0081, 19.0157],
    'Uran Beach': [72.9387, 18.8841],
    'Ulwe City': [73.0206, 18.9953],
    'NMMC Park': [73.0169, 19.0343],
    'Shilp Chowk': [73.0157, 19.0366],],
    'NMMC Garden': [73.0169, 19.0343],
    'Town Hall': [73.0152, 19.0345],
    'Nerul Lake': [73.0206, 19.0377],,
    'DPS Lake': [73.0148, 19.0421],
    'Marina Bay Park': [73.0177, 19.0142],.0142],
    'Belapur Fort': [73.0358, 19.0235]
  };
  
  // Handle API key input change// Handle API key input change
  const handleAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => { React.ChangeEvent<HTMLInputElement>) => {
    setMapboxAPIKey(e.target.value);
    localStorage.setItem('mapboxAPIKey', e.target.value);ey', e.target.value);
  };
  
  // Initialize the map when the dialog is opened// Initialize the map when the dialog is opened
  useEffect(() => {
    console.log('Map dialog open state:', isOpen);p dialog open state:', isOpen);
    console.log('Map container ref exists:', !!mapContainer.current);Container.current);
    
    // Make sure we only initialize when the dialog is open and the map container exists// Make sure we only initialize when the dialog is open and the map container exists
    if (!isOpen || !mapContainer.current) {
      console.log('Dialog not open or map container not ready');ontainer not ready');
      return;
    }
    
    // Don't reinitialize if map already exists// Don't reinitialize if map already exists
    if (map.current) {
      console.log('Map already exists, skipping initialization'); already exists, skipping initialization');
      return;
    }
    
    console.log('Initializing map...');console.log('Initializing map...');

    const initMap = async () => {    const initMap = async () => {
      try {
        // Check for stored API keyCheck for stored API key
        const storedKey = localStorage.getItem('mapboxAPIKey');age.getItem('mapboxAPIKey');
        if (storedKey) {
          setMapboxAPIKey(storedKey);y(storedKey);
          console.log('Found stored API key');PI key');
        } else {
          console.log('No stored API key found');e.log('No stored API key found');
        }

        // Using a default public token that works for basic maps        // Using a default public token that works for basic maps
        const apiKey = storedKey || 'pk.eyJ1IjoibmF2aXRyaXBwbGFubmVyIiwiYSI6ImNsczFheWZxNjAxd3Uyam9pNWNjMnp0Y3MifQ.c15i4R6fWG7YoYBHcaCvVA';mVyIiwiYSI6ImNsczFheWZxNjAxd3Uyam9pNWNjMnp0Y3MifQ.c15i4R6fWG7YoYBHcaCvVA';
        
        // Dynamic import of mapbox-gl with module import// Dynamic import of mapbox-gl with module import
        console.log('Importing mapbox-gl...');
        const mapboxgl = await import('mapbox-gl');gl');
        
        // Import CSS first// Import CSS first
        await import('mapbox-gl/dist/mapbox-gl.css');x-gl/dist/mapbox-gl.css');
        
        console.log('Setting mapbox access token:', apiKey.substring(0, 10) + '...');console.log('Setting mapbox access token:', apiKey.substring(0, 10) + '...');
        mapboxgl.default.accessToken = apiKey;
        
        setError(null);setError(null);
        
        // Create map instance// Create map instance
        console.log('Creating map instance...');map instance...');
        if (!mapContainer.current) {
          console.error('Map container is null');er is null');
          setError('Map container reference is null');ll');
          return;
        }
        
        // Create the map with explicit dimensions to ensure it renders// Create the map with explicit dimensions to ensure it renders
        mapContainer.current.style.width = '100%';
        mapContainer.current.style.height = '400px';';
        
        map.current = new mapboxgl.default.Map({map.current = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',treets-v12',
          center: [73.0169, 19.0330], // Centered on Navi Mumbaiavi Mumbai
          zoom: 11
        });
        
        console.log('Map instance created:', !!map.current);console.log('Map instance created:', !!map.current);
        
        // Add navigation controls// Add navigation controls
        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right'); mapboxgl.default.NavigationControl(), 'top-right');
        
        // Add event listeners for debugging// Add event listeners for debugging
        map.current.on('load', () => {
          console.log('Map loaded successfully');essfully');
          setMapLoaded(true);
        });

        map.current.on('error', (e: any) => {        map.current.on('error', (e: any) => {
          console.error('Map error:', e);
          setError(`Map error: ${e.error?.message || 'Unknown error'}`);.message || 'Unknown error'}`);
        });
        
        // Force a resize to ensure map fills container// Force a resize to ensure map fills container
        setTimeout(() => {
          if (map.current) { {
            console.log('Forcing map resize');cing map resize');
            map.current.resize();
          }
        }, 1000);1000);
      } catch (err) {r) {
        console.error('Error initializing map:', err);('Error initializing map:', err);
        setError(`Could not load the map: ${err instanceof Error ? err.message : 'Unknown error'}`);ceof Error ? err.message : 'Unknown error'}`);
      }
    };

    // Small delay to ensure the container is fully rendered    // Small delay to ensure the container is fully rendered
    const timeoutId = setTimeout(() => {
      initMap();
    }, 500);
    
    // Cleanup// Cleanup
    return () => {=> {
      clearTimeout(timeoutId);(timeoutId);
      if (map.current) {
        console.log('Cleaning up map instance');aning up map instance');
        map.current.remove();
        map.current = null;
        setMapLoaded(false);;
      }
    };
  }, [isOpen]);isOpen]);
  
  // Add markers for each location when map is loaded// Add markers for each location when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) {|| !map.current) {
      console.log('Map not loaded yet or map instance is null'); or map instance is null');
      return;
    }
    
    console.log('Map is loaded, adding markers...');console.log('Map is loaded, adding markers...');
    
    const addMarkers = async () => {const addMarkers = async () => {
      try {
        console.log('Adding markers for locations:', locations);sole.log('Adding markers for locations:', locations);
        const mapboxgl = await import('mapbox-gl');
        
        // Create a bounds object to fit all markers// Create a bounds object to fit all markers
        const bounds = new mapboxgl.default.LngLatBounds();unds();
        let dayColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        let markersAdded = false;
        
        // Add markers for each location with day color coding// Add markers for each location with day color coding
        for (const day of itinerary) {
          const dayColor = dayColors[(day.day - 1) % dayColors.length];day.day - 1) % dayColors.length];
          console.log(`Processing day ${day.day} with color ${dayColor}`);`);
          
          for (const activity of day.activities) {for (const activity of day.activities) {
            console.log(`Processing activity: ${activity.title} at ${activity.location}`);tivity.title} at ${activity.location}`);
            // Get coordinates for the location
            let coordinates: [number, number] | null = null; null = null;
            
            // Look for exact location match first// Look for exact location match first
            if (locationCoordinates[activity.location]) {ion]) {
              coordinates = locationCoordinates[activity.location];location];
              console.log(`Found exact coordinates for ${activity.location}:`, coordinates);ocation}:`, coordinates);
            } else {
              // Try partial matching for locations that contain the name partial matching for locations that contain the name
              const locationKey = Object.keys(locationCoordinates).find(
                key => activity.location.toLowerCase().includes(key.toLowerCase()) || werCase()) || 
                      key.toLowerCase().includes(activity.location.toLowerCase())
              );
              
              if (locationKey) {if (locationKey) {
                coordinates = locationCoordinates[locationKey];cationCoordinates[locationKey];
                console.log(`Found partial match coordinates for ${activity.location} using ${locationKey}:`, coordinates);r ${activity.location} using ${locationKey}:`, coordinates);
              } else {
                console.log(`No coordinates found for location: ${activity.location}`);e.log(`No coordinates found for location: ${activity.location}`);
                // Fallback to Navi Mumbai central coordinates with a small random offsetet
                const randomOffset = () => (Math.random() - 0.5) * 0.02; // Small random offsetoffset
                coordinates = [73.0169 + randomOffset(), 19.0330 + randomOffset()];
                console.log(`Using fallback coordinates for ${activity.location} with random offset:`, coordinates);th random offset:`, coordinates);
              }
            }
            
            if (!coordinates) {if (!coordinates) {
              console.log(`Skipping marker for ${activity.location} due to missing coordinates`);ping marker for ${activity.location} due to missing coordinates`);
              continue;
            }
            
            // Create a popup with activity details// Create a popup with activity details
            const popup = new mapboxgl.default.Popup({ offset: 25 })p({ offset: 25 })
              .setHTML(`
                <div class="p-2">ss="p-2">
                  <h3 class="font-medium text-sm">${activity.title}</h3>-medium text-sm">${activity.title}</h3>
                  <p class="text-xs text-gray-500">${activity.time} - Day ${day.day}</p>y ${day.day}</p>
                  <p class="text-xs mt-1">${activity.location}</p>
                </div>
              `);
            
            // Create a custom element for the marker// Create a custom element for the marker
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = dayColor; = dayColor;
            el.style.width = '20px';
            el.style.height = '20px';;
            el.style.borderRadius = '50%';50%';
            el.style.border = '2px solid white';hite';
            el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';0,0,0,0.3)';
            el.style.cursor = 'pointer';
            el.style.display = 'flex';
            el.style.alignItems = 'center';ter';
            el.style.justifyContent = 'center';er';
            el.style.color = 'white';
            el.style.fontSize = '10px';';
            el.style.fontWeight = 'bold';';
            el.textContent = day.day.toString();ring();
            
            // Create marker// Create marker
            new mapboxgl.default.Marker(el)ault.Marker(el)
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current!);nt!);
            
            // Extend bounds to include this location// Extend bounds to include this location
            bounds.extend(coordinates);
            markersAdded = true;
            console.log(`Added marker for ${activity.location} at coordinates:`, coordinates);arker for ${activity.location} at coordinates:`, coordinates);
          }
        }
        
        // Fit the map to show all markers with padding// Fit the map to show all markers with padding
        if (markersAdded && !bounds.isEmpty()) {
          console.log('Fitting map to bounds');
          setTimeout(() => {
            if (map.current) { {
              map.current.fitBounds(bounds, {ounds(bounds, {
                padding: 50,
                maxZoom: 14
              });
              console.log('Map fitted to bounds');sole.log('Map fitted to bounds');
              
              // Additional resize call after fitting bounds// Additional resize call after fitting bounds
              setTimeout(() => {
                if (map.current) { {
                  map.current.resize();ze();
                }
              }, 500);500);
            }
          }, 1000);1000);
        } else {
          console.log('No valid markers to fit bounds');e.log('No valid markers to fit bounds');
        }
      } catch (err) {atch (err) {
        console.error('Error adding markers:', err);('Error adding markers:', err);
        setError('Could not add location markers to the map.');the map.');
      }
    };
    
    addMarkers();addMarkers();
  }, [mapLoaded, itinerary, locations]);itinerary, locations]);

  useEffect(() => {  useEffect(() => {
    if (!mapLoaded || !map.current) {sOpen || !mapContainer.current) {
      console.log('Map not loaded or map instance is null');
      return;
    }
  
    console.log('Adding markers for itinerary:', itinerary);
   initialized');
    const addMarkers = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        const bounds = new mapboxgl.default.LngLatBounds();
  
        itinerary.forEach(day => {
          day.activities.forEach(activity => {
            if (activity.location) {
              const coordinates = locations[activity.location];ose()}>
              if (coordinates) {nt className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                console.log(`Adding marker for ${activity.location} at ${coordinates}`);
                new mapboxgl.default.Marker() className="flex items-center">
                  .setLngLat(coordinates)e="h-5 w-5 mr-2" />
                  .addTo(map.current!);
                bounds.extend(coordinates);
              }
            }
          });Name="flex-1 min-h-[400px] relative mt-4 rounded-md overflow-hidden">
        });
  te inset-0 flex flex-col items-center justify-center bg-muted/20 text-center p-4">
        if (!bounds.isEmpty()) {uctive mb-2">{error}</p>
          map.current.fitBounds(bounds, { padding: 50 });ted-foreground mb-4">
        } valid Mapbox API key.
      } catch (err) {
        console.error('Error adding markers:', err);-w-md">
      }
    };pe="text"
   px-3 py-2 border rounded-md mb-2"
    addMarkers();er="Enter Mapbox API Key"
  }, [mapLoaded, itinerary]);y}
 onChange={handleAPIKeyChange}
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">Click={() => {
        <DialogHeader>  if (map.current) {
          <DialogTitle className="flex items-center">       map.current.remove();
            <MapIcon className="h-5 w-5 mr-2" />
            Your Itinerary Map        }
          </DialogTitle>      setMapLoaded(false);
        </DialogHeader>            setError(null);
        
        <div className="flex-1 min-h-[400px] relative mt-4 rounded-md overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 text-center p-4">
              <p className="text-destructive mb-2">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">API Key
                You may need to provide a valid Mapbox API key.
              </p>
              <div className="w-full max-w-md">v>
                <input
                  type="text"mapContainer} className="absolute inset-0 rounded-lg" style={{ minHeight: "400px" }} />
                  className="w-full px-3 py-2 border rounded-md mb-2"
                  placeholder="Enter Mapbox API Key"    </div>
                  value={mapboxAPIKey}      
                  onChange={handleAPIKeyChange}        <DialogFooter className="mt-4">
                />ex flex-col w-full gap-2">
                <Button             <div className="text-sm text-muted-foreground">






































export default ItineraryMap;};  );    </Dialog>      </DialogContent>        </DialogFooter>          </div>            </DialogClose>              <Button className="w-full">Close Map</Button>            <DialogClose asChild>            </div>              Showing {locations.length} unique locations in your itinerary            <div className="text-sm text-muted-foreground">          <div className="flex flex-col w-full gap-2">        <DialogFooter className="mt-4">                </div>          )}            <div ref={mapContainer} className="absolute inset-0 rounded-lg" style={{ minHeight: "400px" }} />          ) : (            </div>              </div>                </Button>                  Retry with new API Key                >                  className="w-full"                  size="sm"                  variant="outline"                  }}                    setError(null);                    setMapLoaded(false);                    }                      map.current = null;                      map.current.remove();                    if (map.current) {                  onClick={() => {              Showing {locations.length} unique locations in your itinerary
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
