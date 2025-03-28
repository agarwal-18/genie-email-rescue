
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Calendar, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import { getAllPlaces } from '@/lib/data';
import Weather from '@/components/Weather';
import TripTips from '@/components/TripTips';

const Index = () => {
  const [featuredPlaces, setFeaturedPlaces] = useState<any[]>([]);
  const heroImageUrl = "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=1470&auto=format&fit=crop";

  useEffect(() => {
    // Get places from data.ts
    const places = getAllPlaces();
    // Get the featured places or the first 3 places
    const featured = places
      .filter(place => place.featured)
      .slice(0, 3);
    
    // If we don't have 3 featured places, add some non-featured ones
    if (featured.length < 3) {
      const nonFeatured = places
        .filter(place => !place.featured)
        .slice(0, 3 - featured.length);
      
      setFeaturedPlaces([...featured, ...nonFeatured]);
    } else {
      setFeaturedPlaces(featured);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <Hero
        title="Discover Navi Mumbai"
        subtitle="Explore the hidden gems and must-visit places in the planned city of Navi Mumbai, Maharashtra."
        ctaText="Start Exploring"
        ctaLink="/places"
        imageUrl={heroImageUrl}
      />
      
      {/* Features Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Plan your perfect Navi Mumbai exploration in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Discover Places"
              description="Explore curated destinations across Navi Mumbai from scenic spots to cultural attractions."
              icon={<MapPin className="h-10 w-10" />}
              buttonText="View Places"
              buttonLink="/places"
            />
            <FeatureCard
              title="Plan Itineraries"
              description="Create customized travel plans with our easy-to-use itinerary builder based on your preferences."
              icon={<Calendar className="h-10 w-10" />}
              buttonText="Plan Now"
              buttonLink="/itinerary"
            />
            <FeatureCard
              title="Get Recommendations"
              description="Receive personalized suggestions for attractions, dining, and activities tailored to your interests."
              icon={<Compass className="h-10 w-10" />}
              buttonText="Get Started"
              buttonLink="/register"
            />
          </div>
        </div>
      </section>
      
      {/* Featured Places Section */}
      <section className="py-16 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold">Featured Destinations</h2>
              <p className="mt-2 text-muted-foreground">
                Explore these popular spots in Navi Mumbai
              </p>
            </div>
            <Link to="/places">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPlaces.map((place) => (
              <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle>{place.name}</CardTitle>
                    <div className="flex items-center bg-primary/10 text-primary text-sm px-2 py-1 rounded-full">
                      <span className="font-medium">{place.rating}</span>
                      <span className="ml-1">★</span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {place.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {place.description}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{place.duration}</span>
                  </div>
                  <Link to={`/places?id=${place.id}`}>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Travel Tips & Weather Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Travel Resources</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Essential information to make your Navi Mumbai exploration enjoyable
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Weather Widget */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Local Weather</h3>
              <Weather location="Navi Mumbai" className="h-full" />
            </div>
            
            {/* Travel Tips */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Travel Tips</h3>
              <TripTips locations={['Vashi', 'Nerul', 'Kharghar']} />
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Subscribe to our newsletter for the latest travel tips, new destinations, and special events in Navi Mumbai.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
