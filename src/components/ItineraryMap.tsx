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
import L from 'leaflet'; // Import Leaflet
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

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
  const map = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get all unique locations from itinerary
  const locations = itinerary.flatMap(day =>
    day.activities.map(activity => activity.location)
  ).filter((value, index, self) => self.indexOf(value) === index);

  // Navi Mumbai locations with coordinates
  const locationCoordinates: Record<string, [number, number]> = {
    'Vashi': [19.0330, 73.0169],
    'Nerul': [19.0337, 73.0223],
    'Belapur': [19.0180, 73.0250],
    'Kharghar': [19.0330, 73.0650],
    // Add more known locations here
  };

  // Default fallback coordinates for Navi Mumbai
  const defaultCoordinates: [number, number] = [19.0330, 73.0169];

  // Initialize the map when the dialog is opened
  useEffect(() => {
    if (!isOpen) return;

    if (map.current) {
      map.current.remove();
    }

    map.current = L.map(mapContainer.current!).setView(defaultCoordinates, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    setMapLoaded(true);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [isOpen]);

  // Add markers for each location when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const bounds = L.latLngBounds([]);

    locations.forEach(location => {
      const coordinates = locationCoordinates[location] || defaultCoordinates;
      const marker = L.marker(coordinates).addTo(map.current!);
      marker.bindPopup(`<b>${location}</b>`).openPopup();
      bounds.extend(coordinates);
    });

    map.current.fitBounds(bounds);
  }, [mapLoaded, locations]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <MapIcon className="mr-2" /> Itinerary Map
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              <X />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div ref={mapContainer} className="h-96 w-full rounded-md shadow-md" />
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItineraryMap;
