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
    'Uran Beach': [72.9387, 18.8841],
    'Ulwe City': [73.0206, 18.9953],
    'NMMC Park': [73.0169, 19.0343],
    'Shilp Chowk': [73.0157, 19.0366],
    'NMMC Garden': [73.0169, 19.0343],
    'Town Hall': [73.0152, 19.0345],
    'Nerul Lake': [73.0206, 19.0377],
    'DPS Lake': [73.0148, 19.0421],
    'Marina Bay Park': [73.0177, 19.0142],
    'Belapur Fort': [73.0358, 19.0235]
  };
  
  // Handle API key input change
  const handleAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMapboxAPIKey(e.target.value);
    localStorage.setItem('mapboxAPIKey', e.target.value);
  };
  
  // Initialize the map when the dialog is opened
  useEffect(() => {
    if (!isOpen || !mapContainer.current) {
      console.log('Map dialog not open or map container not ready');
      return;
    }

    if (map.current) {
      console.log('Map already initialized');
      return;
    }

    console.log('Initializing map...');
    const initMap = async () => {
      try {
        const storedKey = localStorage.getItem('mapboxAPIKey');
        const apiKey = storedKey || 'pk.eyJ1IjoibmF2aXRyaXBwbGFubmVyIiwiYSI6ImNsczFheWZxNjAxd3Uyam9pNWNjMnp0Y3MifQ.c15i4R6fWG7YoYBHcaCvVA';

        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');

        mapboxgl.default.accessToken = apiKey;

        if (!mapContainer.current) {
          setError('Map container reference is null');
          return;
        }

        map.current = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [73.0169, 19.0330],
          zoom: 11,
        });

        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

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

            const coordinates = locationCoordinates[activity.location] || [73.0169, 19.0330];
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
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.cursor = 'pointer';

            new mapboxgl.default.Marker(el)
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current!);

            bounds.extend(coordinates);
          });
        });

        if (!bounds.isEmpty()) {
          console.log('Fitting map bounds to markers');
          map.current.fitBounds(bounds, { padding: 50 });
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
