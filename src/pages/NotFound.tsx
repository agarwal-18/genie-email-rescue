
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { API_CONFIG } from "@/config";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // If the path contains a valid route, it might be a refresh issue
  const possibleRoute = location.pathname.split('/')[1];
  const isKnownRoute = API_CONFIG.validRoutes.includes(possibleRoute);
  
  // Log 404 errors to console for debugging
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Is known route:", isKnownRoute
    );
  }, [location.pathname, isKnownRoute]);
  
  // Auto-retry known routes after countdown
  useEffect(() => {
    let timer: number;
    
    if (isKnownRoute && !isNavigating && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    }
    
    if (isKnownRoute && countdown === 0 && !isNavigating) {
      setIsNavigating(true);
      navigate(location.pathname);
    }
    
    return () => {
      window.clearTimeout(timer);
    };
  }, [countdown, navigate, location.pathname, isKnownRoute, isNavigating]);
  
  const handleRetry = () => {
    setIsNavigating(true);
    navigate(location.pathname);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Oops! Page not found</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          The page you're looking for ({location.pathname}) doesn't exist or has been moved.
        </p>
        
        {isKnownRoute && !isNavigating && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              This looks like a valid route. It might be a refresh issue.
              Attempting to navigate in {countdown} seconds...
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {isKnownRoute && (
            <Button 
              onClick={handleRetry} 
              className="w-full flex items-center justify-center"
              disabled={isNavigating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isNavigating ? "Navigating..." : "Try Again"}
            </Button>
          )}
          
          <Link to="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
          
          <Link to="/forum">
            <Button variant="outline" className="w-full">Go to Forum</Button>
          </Link>
        </div>
        
        <div className="mt-6 text-xs text-gray-400">
          If you believe this is an error, please try refreshing the page or contact support.
        </div>
      </div>
    </div>
  );
};

export default NotFound;
