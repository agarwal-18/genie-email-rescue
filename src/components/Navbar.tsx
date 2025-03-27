
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when changing routes
    setIsOpen(false);
  }, [location]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-lg font-medium">
            <MapPin className="h-6 w-6 text-navi-blue" />
            <span className="font-semibold">NaviExplore</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/places" className={`nav-link ${isActive('/places') ? 'active' : ''}`}>Explore</Link>
            <Link to="/itinerary" className={`nav-link ${isActive('/itinerary') ? 'active' : ''}`}>Planner</Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="default" size="sm" className="text-sm font-medium">
                Register
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full hover:bg-accent"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`md:hidden glass-dark overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className={`px-4 py-2 rounded-lg ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>Home</Link>
            <Link to="/places" className={`px-4 py-2 rounded-lg ${isActive('/places') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>Explore</Link>
            <Link to="/itinerary" className={`px-4 py-2 rounded-lg ${isActive('/itinerary') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>Planner</Link>
          </nav>
          <div className="flex space-x-2 pt-2 border-t border-border">
            <Link to="/login" className="flex-1">
              <Button variant="ghost" className="w-full text-sm" size="sm">Sign In</Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button variant="default" className="w-full text-sm" size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
