
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
        <img 
          src="https://images.unsplash.com/photo-1609876468147-a1000d7e011b?q=80&w=2670&auto=format&fit=crop"
          alt="Navi Mumbai Skyline" 
          className="w-full h-full object-cover animate-image-glow"
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-md">
              Discover <span className="text-gradient bg-gradient-to-r from-white to-white/80">Navi Mumbai</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow">
              Explore the best attractions, cuisine, and experiences
              tailored to your preferences.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/places">
                <Button size="lg" className="font-medium text-base w-full sm:w-auto">
                  Explore Places
                </Button>
              </Link>
              <Link to="/itinerary">
                <Button variant="outline" size="lg" className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 font-medium text-base w-full sm:w-auto">
                  Plan Itinerary
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Arrow */}
      <button 
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 animate-bounce transition-colors"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

export default Hero;
