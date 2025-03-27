
import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import PlaceCard from '@/components/PlaceCard';
import { getAllPlaces } from '@/lib/data';

const Places = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState('popularity');
  const [allPlaces, setAllPlaces] = useState(getAllPlaces());
  const [filteredPlaces, setFilteredPlaces] = useState(allPlaces);

  const categories = [
    'All', 'Park', 'Temple', 'Mall', 'Restaurant', 
    'Entertainment', 'Viewpoint', 'Museum', 'Nature'
  ];

  useEffect(() => {
    let results = allPlaces;
    
    // Apply search filter
    if (searchQuery) {
      results = results.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All') {
      results = results.filter(place => 
        place.category === selectedCategory
      );
    }
    
    // Apply sorting
    results = [...results].sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Default: popularity
        return 0; // In a real app, we'd have a popularity field
      }
    });
    
    setFilteredPlaces(results);
  }, [searchQuery, selectedCategory, sortBy, allPlaces]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('popularity');
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-4xl font-bold">Explore Navi Mumbai</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover all the amazing places to visit in the city
            </p>
          </div>
          
          {/* Search & Filters */}
          <div className="mb-10 max-w-4xl mx-auto">
            <div className="glass rounded-xl p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search places..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge 
                    key={category}
                    variant={category === selectedCategory || (category === 'All' && !selectedCategory) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                  >
                    {category === selectedCategory && <X className="h-3 w-3 mr-1" />}
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredPlaces.length}</span> places found
              </div>
              
              {hasActiveFilters && (
                <Button variant="link" size="sm" onClick={clearFilters} className="h-auto p-0">
                  Clear filters
                </Button>
              )}
            </div>
          </div>
          
          {/* Places Grid */}
          {filteredPlaces.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place, index) => (
                <div key={place.id} className="animate-fade-up" style={{ animationDelay: `${index % 3 * 100}ms` }}>
                  <PlaceCard {...place} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No places found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Places;
