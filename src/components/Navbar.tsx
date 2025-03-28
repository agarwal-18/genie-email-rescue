
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, MapPin, LogOut, MessageSquare, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
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
            <Link to="/forum" className={`nav-link ${isActive('/forum') ? 'active' : ''}`}>Forum</Link>
            {user && (
              <>
                <Link to="/itinerary" className={`nav-link ${isActive('/itinerary') ? 'active' : ''}`}>Planner</Link>
                <Link to="/saved-itineraries" className={`nav-link ${isActive('/saved-itineraries') ? 'active' : ''}`}>My Itineraries</Link>
              </>
            )}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-sm font-medium">
                    <User className="h-4 w-4 mr-2" />
                    {user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => location.pathname !== "/profile" && window.location.assign("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
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
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle for Mobile */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full hover:bg-accent"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`md:hidden glass-dark overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className={`px-4 py-2 rounded-lg ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>Home</Link>
            <Link to="/places" className={`px-4 py-2 rounded-lg ${isActive('/places') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>Explore</Link>
            <Link to="/forum" className={`px-4 py-2 rounded-lg ${isActive('/forum') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Forum
              </div>
            </Link>
            {user && (
              <>
                <Link to="/itinerary" className={`px-4 py-2 rounded-lg ${isActive('/itinerary') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>Planner</Link>
                <Link to="/saved-itineraries" className={`px-4 py-2 rounded-lg ${isActive('/saved-itineraries') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>My Itineraries</Link>
                <Link to="/profile" className={`px-4 py-2 rounded-lg ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </div>
                </Link>
              </>
            )}
          </nav>
          <div className="flex space-x-2 pt-2 border-t border-border">
            {user ? (
              <Button variant="outline" className="w-full text-sm" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/login" className="flex-1">
                  <Button variant="ghost" className="w-full text-sm" size="sm">Sign In</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button variant="default" className="w-full text-sm" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
