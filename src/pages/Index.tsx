
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import FeatureCard from '@/components/FeatureCard';
import PlaceCard from '@/components/PlaceCard';
import { MapPin, Calendar, Compass, Clock, Bookmark } from 'lucide-react';

const Index = () => {
  const [activeFeature, setActiveFeature] = useState<number>(0);
  
  const features = [
    {
      title: 'Personalized Itineraries',
      description: 'Create custom travel plans tailored to your preferences, budget, and schedule.',
      icon: Calendar,
    },
    {
      title: 'AI-Powered Suggestions',
      description: 'Get intelligent recommendations for attractions, restaurants, and activities.',
      icon: Compass,
    },
    {
      title: 'Time-Saving Planning',
      description: 'Efficiently organize your trip with our smart scheduling tools.',
      icon: Clock,
    },
    {
      title: 'Save Your Favorites',
      description: 'Bookmark and revisit your favorite itineraries for future adventures.',
      icon: Bookmark,
    }
  ];
  
  const featuredDestinations = [
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
  ];
  
  const topExperiences = [
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
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <Hero 
        title="Discover Your Perfect Journey"
        subtitle="AI-powered travel planning that creates personalized itineraries tailored to your interests, budget, and schedule."
        ctaText="Plan Your Trip"
        ctaLink="/itinerary"
        imageUrl="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1421&auto=format&fit=crop"
      />
      
      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How NaviExplore Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform streamlines travel planning, making it easy to create the perfect itinerary.
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
              Explore some of the world's most incredible places with our curated recommendations.
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
            Unforgettable activities and adventures for every type of traveler.
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Plan Your Next Adventure?</h2>
          <p className="mb-8 opacity-90 max-w-2xl mx-auto">
            Create a personalized itinerary tailored to your interests, budget, and schedule with our AI-powered travel planner.
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
