
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
              Oops! We couldn't find the page you're looking for.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              The page at <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.pathname}</span> doesn't exist.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" className="w-full sm:w-auto">
                <Link to="/" className="flex items-center justify-center">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <Link to="#" className="flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
