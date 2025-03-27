import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import FeatureCard from '@/components/FeatureCard';
import PlaceCard from '@/components/PlaceCard';
import { MapPin, Calendar, Compass, Clock, Bookmark } from 'lucide-react';
import { getAllPlaces } from '@/lib/data';

const Index = () => {
  const [activeFeature, setActiveFeature] = useState<number>(0);
  
  const features = [
    {
      title: 'Personalized Itineraries',
      description: 'Create custom exploration plans tailored to your preferences, budget, and schedule.',
      icon: Calendar,
    },
    {
      title: 'AI-Powered Suggestions',
      description: 'Get intelligent recommendations for attractions, restaurants, and activities in Navi Mumbai.',
      icon: Compass,
    },
    {
      title: 'Time-Saving Planning',
      description: 'Efficiently organize your Navi Mumbai exploration with our smart scheduling tools.',
      icon: Clock,
    },
    {
      title: 'Save Your Favorites',
      description: 'Bookmark and revisit your favorite itineraries for future adventures.',
      icon: Bookmark,
    }
  ];
  
  // Get all Navi Mumbai places from data.ts
  const allPlaces = getAllPlaces();
  
  // Get featured places (those with featured flag or highest rated)
  const featuredDestinations = allPlaces
    .filter(place => place.featured || place.rating >= 4.5)
    .slice(0, 3);
  
  // Get top experiences (different categories for variety)
  const topExperiences = allPlaces
    .filter(place => !featuredDestinations.some(fp => fp.id === place.id))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <Hero 
        title="Discover Navi Mumbai"
        subtitle="AI-powered trip planning that creates personalized Navi Mumbai itineraries tailored to your interests, budget, and schedule."
        ctaText="Plan Your Exploration"
        ctaLink="/itinerary"
        imageUrl="https://images.unsplash.com/photo-1582649155902-afcacf182863?q=80&w=2670&auto=format&fit=crop"
      />
      
      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How NaviExplore Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform streamlines Navi Mumbai exploration planning, making it easy to create the perfect itinerary.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  activeFeature === index 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-card hover:bg-accent'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    activeFeature === index 
                      ? 'bg-primary-foreground text-primary' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">{feature.title}</h3>
                    <p className={activeFeature === index ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1072&auto=format&fit=crop" 
              alt="Travel planning on tablet" 
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">Smart Planning</h3>
                <p className="opacity-90">Create your perfect itinerary with the help of AI</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Destinations */}
      <section className="py-20 px-4 md:px-6 bg-accent/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Destinations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore some of Navi Mumbai's most incredible places with our curated recommendations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.map((destination) => (
              <PlaceCard
                key={destination.id}
                id={destination.id}
                name={destination.name}
                category={destination.category}
                description={destination.description}
                image={destination.image}
                rating={destination.rating}
                location={destination.location}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/places">
              <Button size="lg" variant="outline">
                Explore More Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Top Experiences */}
      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Top Experiences</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unforgettable activities and adventures for every type of explorer in Navi Mumbai.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topExperiences.map((experience) => (
            <PlaceCard
              key={experience.id}
              id={experience.id}
              name={experience.name}
              category={experience.category}
              description={experience.description}
              image={experience.image}
              rating={experience.rating}
              duration={experience.duration}
              location={experience.location}
            />
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore Navi Mumbai?</h2>
          <p className="mb-8 opacity-90 max-w-2xl mx-auto">
            Create a personalized itinerary tailored to your interests, budget, and schedule with our AI-powered Navi Mumbai exploration planner.
          </p>
          <Link to="/itinerary">
            <Button size="lg" variant="secondary">
              <MapPin className="mr-2 h-5 w-5" />
              Start Planning Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
