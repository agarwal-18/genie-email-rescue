
import { useState, useEffect } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
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
import PlaceCard from '@/components/PlaceCard';
import Navbar from '@/components/Navbar';

const Places = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);

  const places = [
    {
      id: 1,
      name: 'Eiffel Tower',
      category: 'Monument',
      description: 'Iconic iron lattice tower on the Champ de Mars in Paris, France, named after engineer Gustave Eiffel.',
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1287&auto=format&fit=crop',
      rating: 4.8,
      location: 'Paris, France',
    },
    {
      id: 2,
      name: 'Kyoto Temples',
      category: 'Cultural',
      description: 'Ancient Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1170&auto=format&fit=crop',
      rating: 4.9,
      location: 'Kyoto, Japan',
    },
    {
      id: 3,
      name: 'Grand Canyon',
      category: 'Natural Wonder',
      description: 'Steep-sided canyon carved by the Colorado River in Arizona, United States.',
      image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=1170&auto=format&fit=crop',
      rating: 4.9,
      location: 'Arizona, USA',
    },
    {
      id: 4,
      name: 'Northern Lights Tour',
      category: 'Adventure',
      description: 'Experience the magical aurora borealis dancing across the Arctic sky.',
      image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?q=80&w=1170&auto=format&fit=crop',
      rating: 4.9,
      duration: '4 hours',
      location: 'Tromsø, Norway',
    },
    {
      id: 5,
      name: 'Santorini Sunset Cruise',
      category: 'Leisure',
      description: 'Sail around the volcanic islands of Santorini and enjoy breathtaking sunset views.',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1074&auto=format&fit=crop',
      rating: 4.7,
      duration: '5 hours',
      location: 'Santorini, Greece',
    },
    {
      id: 6,
      name: 'Machu Picchu Hike',
      category: 'Adventure',
      description: 'Trek the legendary Inca Trail to discover the ancient city of Machu Picchu.',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1172&auto=format&fit=crop',
      rating: 4.8,
      duration: '4 days',
      location: 'Cusco, Peru',
    },
    {
      id: 7,
      name: 'Colosseum',
      category: 'Historical',
      description: 'Ancient Roman gladiatorial arena and iconic symbol of Imperial Rome.',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1096&auto=format&fit=crop',
      rating: 4.7,
      location: 'Rome, Italy',
    },
    {
      id: 8,
      name: 'Great Barrier Reef',
      category: 'Natural Wonder',
      description: 'World\'s largest coral reef system off the coast of Queensland, Australia.',
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1287&auto=format&fit=crop',
      rating: 4.9,
      location: 'Queensland, Australia',
    },
    {
      id: 9,
      name: 'Safari Experience',
      category: 'Adventure',
      description: 'Explore the African savanna and witness incredible wildlife in their natural habitat.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1286&auto=format&fit=crop',
      rating: 4.9,
      duration: '5 days',
      location: 'Serengeti, Tanzania',
    },
  ];

  // Get all unique categories
  const categories = ['all', ...Array.from(new Set(places.map(place => place.category)))];

  useEffect(() => {
    // Filter places based on search term and category
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
    
    setFilteredPlaces(results);
  }, [searchTerm, category]);

  const featuredPlace = places[0]; // Eiffel Tower as featured

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Explore Amazing Destinations</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover fascinating places around the world to add to your next travel itinerary.
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-12 grid gap-4 md:flex md:items-center md:space-x-4">
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
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Featured Destination */}
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
            />
          </div>
          
          {/* All Places */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.slice(1).map((place) => (
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
              />
            ))}
          </div>
          
          {filteredPlaces.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No destinations found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Places;
