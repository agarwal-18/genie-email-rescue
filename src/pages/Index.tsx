
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Map, Sparkles, Compass, UtilityPole, Ship, Building, Leaf, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import PlaceCard from '@/components/PlaceCard';
import { getPopularPlaces } from '@/lib/data';

const Index = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const popularPlaces = getPopularPlaces().slice(0, 3);

  const features = [
    {
      icon: Map,
      title: 'Interactive Maps',
      description: 'Navigate through Navi Mumbai with ease using our detailed maps.',
      color: 'bg-navi-blue'
    },
    {
      icon: Sparkles,
      title: 'Personalized Itineraries',
      description: 'Get custom travel plans based on your preferences and interests.',
      color: 'bg-navi-violet'
    },
    {
      icon: Compass,
      title: 'Local Insights',
      description: 'Discover hidden gems with recommendations from locals.',
      color: 'bg-navi-teal'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      <div id="main-content" ref={contentRef} className="pt-16 pb-20">
        {/* Features Section */}
        <section className="container mx-auto px-4 md:px-6 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Explore Navi Mumbai Like Never Before</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Your ultimate guide to experiencing the best of the city
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </section>
        
        {/* Popular Destinations */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Popular Destinations</h2>
                <p className="mt-2 text-muted-foreground">
                  Most visited places in Navi Mumbai
                </p>
              </div>
              <Link to="/places">
                <Button variant="link" className="text-primary">View all places</Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {popularPlaces.map((place, index) => (
                <div key={place.id} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <PlaceCard {...place} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Navi Mumbai Highlights */}
        <section className="container mx-auto px-4 md:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Navi Mumbai Highlights</h2>
                <p className="text-muted-foreground">
                  Discover the planned city of the future with pristine 
                  infrastructure, lush greenery, and a perfect blend of 
                  urban development with natural beauty.
                </p>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-navi-teal/10 p-2 rounded-lg">
                      <Building className="h-5 w-5 text-navi-teal" />
                    </div>
                    <div>
                      <h3 className="font-medium">Modern Architecture</h3>
                      <p className="text-sm text-muted-foreground">Iconic structures and planned urban landscape</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-navi-green/10 p-2 rounded-lg">
                      <Leaf className="h-5 w-5 text-navi-green" />
                    </div>
                    <div>
                      <h3 className="font-medium">Parks & Nature</h3>
                      <p className="text-sm text-muted-foreground">Beautiful parks, mangroves and flamingo sanctuaries</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-navi-indigo/10 p-2 rounded-lg">
                      <Ship className="h-5 w-5 text-navi-indigo" />
                    </div>
                    <div>
                      <h3 className="font-medium">Waterfront Views</h3>
                      <p className="text-sm text-muted-foreground">Stunning creeks and coastal landscapes</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-navi-blue/10 p-2 rounded-lg">
                      <UtilityPole className="h-5 w-5 text-navi-blue" />
                    </div>
                    <div>
                      <h3 className="font-medium">Connected Living</h3>
                      <p className="text-sm text-muted-foreground">Excellent public transportation and infrastructure</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Link to="/itinerary">
                    <Button>Plan Your Visit</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1570168763841-c88fe2fab8a5?q=80&w=2574&auto=format&fit=crop"
                    alt="Navi Mumbai View" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-48 h-48 rounded-lg overflow-hidden shadow-lg border-4 border-background">
                  <img 
                    src="https://images.unsplash.com/photo-1600457108015-41909b7e8dc3?q=80&w=2574&auto=format&fit=crop"
                    alt="Navi Mumbai Detail" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-gradient-to-r from-navi-blue to-navi-indigo text-white py-16">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Explore Navi Mumbai?</h2>
              <p className="text-white/80 mb-8">
                Create your personalized itinerary in minutes and discover the best of Navi Mumbai.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" variant="default" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                    Sign Up Free
                  </Button>
                </Link>
                <Link to="/places">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 w-full sm:w-auto">
                    Browse Places
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="bg-foreground/5 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center space-x-2 text-lg font-medium">
                <MapPin className="h-6 w-6 text-navi-blue" />
                <span className="font-semibold">NaviExplore</span>
              </Link>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Your complete guide to exploring Navi Mumbai, with personalized itineraries and local insights.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-medium mb-3">Navigation</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                  <li><Link to="/places" className="text-muted-foreground hover:text-foreground">Explore</Link></li>
                  <li><Link to="/itinerary" className="text-muted-foreground hover:text-foreground">Itinerary</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Account</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/login" className="text-muted-foreground hover:text-foreground">Sign In</Link></li>
                  <li><Link to="/register" className="text-muted-foreground hover:text-foreground">Register</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} NaviExplore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
