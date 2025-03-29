
import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaceCard from '@/components/PlaceCard';
import Navbar from '@/components/Navbar';
import { getAllPlaces } from '@/lib/data';
import Weather from '@/components/Weather';

interface Place {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  location: string;
  duration?: string;
  featured?: boolean;
}

const Places = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('Vashi');
  const [currentTab, setCurrentTab] = useState('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [featuredPlace, setFeaturedPlace] = useState<Place | null>(null);

  // Get places from data.ts
  const places = getAllPlaces();

  // Get all unique categories
  const categories = ['all', ...Array.from(new Set(places.map(place => place.category)))];
  
  // Get all unique locations
  const locations = Array.from(new Set(places.map(place => place.location)));

  // Toggle favorite status for a place
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id];
      
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  useEffect(() => {
    // Filter places based on search term, category, and current tab
    let results = places;
    
    if (searchTerm) {
      results = results.filter(place => 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      results = results.filter(place => place.category === category);
    }

    // Filter by tab (all or favorites)
    if (currentTab === 'favorites') {
      results = results.filter(place => favorites.includes(place.id));
      setFeaturedPlace(null);
    } else {
      // Find a featured place that matches the current category filter
      const possibleFeaturedPlaces = places.filter(place => 
        place.featured && (category === 'all' || place.category === category)
      );
      
      // Use the first matching featured place, or null if none
      setFeaturedPlace(possibleFeaturedPlaces.length > 0 ? possibleFeaturedPlaces[0] : null);
      
      // Remove the featured place from the filtered results to avoid duplication
      if (possibleFeaturedPlaces.length > 0) {
        results = results.filter(place => place.id !== possibleFeaturedPlaces[0].id);
      }
    }
    
    setFilteredPlaces(results);
  }, [searchTerm, category, places, currentTab, favorites]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Explore Navi Mumbai</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover fascinating places around Navi Mumbai to add to your next exploration plan.
            </p>
          </div>
          
          {/* Weather Component */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Local Weather</h2>
              <Select 
                value={selectedLocation} 
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc as string} value={loc as string}>{loc as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Weather location={selectedLocation} />
          </div>
          
          {/* Search and Filter */}
          <div className="mb-8 grid gap-4 md:flex md:items-center md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by destination or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="md:w-64">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((cat) => (
                      <SelectItem key={cat as string} value={cat as string}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs for All/Favorites */}
          <div className="mb-8">
            <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                <TabsTrigger value="all">All Places</TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Favorites
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Featured Destination (only show in All tab) */}
          {currentTab === 'all' && featuredPlace && (
            <div className="mb-12">
              <PlaceCard
                id={featuredPlace.id}
                name={featuredPlace.name}
                category={featuredPlace.category}
                description={featuredPlace.description}
                image={featuredPlace.image}
                rating={featuredPlace.rating}
                location={featuredPlace.location}
                featured={true}
                onFavoriteToggle={toggleFavorite}
                isFavorite={favorites.includes(featuredPlace.id)}
              />
            </div>
          )}
          
          {/* All Places or Favorites */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                id={place.id}
                name={place.name}
                category={place.category}
                description={place.description}
                image={place.image}
                rating={place.rating}
                duration={place.duration}
                location={place.location}
                onFavoriteToggle={toggleFavorite}
                isFavorite={favorites.includes(place.id)}
              />
            ))}
          </div>
          
          {filteredPlaces.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">
                {currentTab === 'favorites' 
                  ? "No favorite destinations yet" 
                  : "No destinations found"}
              </h3>
              <p className="text-muted-foreground">
                {currentTab === 'favorites'
                  ? "Click the star icon on any destination to add it to your favorites"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Places;
