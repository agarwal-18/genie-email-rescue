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
  const [mapboxAPIKey, setMapboxAPIKey] = useState<string>(() => {
    return localStorage.getItem('mapboxAPIKey') || '';
  });

  // Get all unique locations from itinerary
  const locations = itinerary.flatMap(day =>  
    day.activities.map(activity => activity.location)
  ).filter((value, index, self) => self.indexOf(value) === index);

  // Navi Mumbai locations with coordinates
  const locationCoordinates: Record<string, [number, number]> = {
    'Vashi': [73.0169, 19.0330],
    'Nerul': [73.0223, 19.0337],
    'Belapur': [73.0250, 19.0180],
    'Kharghar': [73.0650, 19.0330],
    // Add more known locations here
  };

  // Default fallback coordinates for Navi Mumbai
  const defaultCoordinates: [number, number] = [73.0169, 19.0330];
  
  // Handle API key input change
  const handleAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMapboxAPIKey(e.target.value);
    localStorage.setItem('mapboxAPIKey', e.target.value);
  };
  
  // Initialize the map when the dialog is opened
  useEffect(() => {
    if (!isOpen) return;

    const initMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        if (!mapboxAPIKey) {
          console.error('Mapbox API key is missing. Please set it in localStorage.');
          setError('Mapbox API key is missing.');
          return;
        }

        mapboxgl.default.accessToken = mapboxAPIKey;

        if (map.current) {
          map.current.remove();
        }

        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: defaultCoordinates,
          zoom: 12,
        });

        map.current.on('load', () => {
          console.log('Map loaded successfully');
          setMapLoaded(true);
        });

        map.current.on('error', (e: any) => {
          console.error('Map error:', e);
          setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(`Could not load the map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        console.log('Cleaning up map instance');
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [isOpen]);

  // Add markers for each location when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) {
      console.log('Map not loaded or map instance is null');
      return;
    }

    console.log('Adding markers for itinerary:', itinerary);

    const addMarkers = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        const bounds = new mapboxgl.default.LngLatBounds();

        itinerary.forEach(day => {
          const dayColor = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'][(day.day - 1) % 7];

          day.activities.forEach(activity => {
            if (!activity.location) {
              console.warn(`Skipping activity with missing location: ${activity.title}`);
              return;
            }

            const coordinates = locationCoordinates[activity.location] || defaultCoordinates;
            if (coordinates === defaultCoordinates) {
              console.warn(`Using default coordinates for location: ${activity.location}`);
            }

            console.log(`Adding marker for location: ${activity.location}`, coordinates);

            const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(`
              <div>
                <h3>${activity.title}</h3>
                <p>${activity.time} - Day ${day.day}</p>
                <p>${activity.location}</p>
              </div>
            `);

            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = dayColor;
            el.style.width = '12px';
            el.style.height = '12px';
            el.style.borderRadius = '50%';

            new mapboxgl.default.Marker(el)
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current);

            bounds.extend(coordinates);
          });
        });

        map.current.fitBounds(bounds, { padding: 50 });
      } catch (err) {
        console.error('Error adding markers:', err);
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
              <p className="text-sm text-muted-foreground mb-4">
                You may need to provide a valid Mapbox API key.
              </p>
              <div className="w-full max-w-md">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md mb-2"
                  placeholder="Enter Mapbox API Key"
                  value={mapboxAPIKey}
                  onChange={handleAPIKeyChange}
                />
                <Button
                  className="w-full"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setMapLoaded(false);
                    if (map.current) {
                      map.current.remove();
                      map.current = null;
                    }
                  }}
                >
                  Retry with new API Key
                </Button>
              </div>
            </div>
          ) : (
            <div ref={mapContainer} className="absolute inset-0 rounded-lg" style={{ minHeight: "400px" }} />
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
