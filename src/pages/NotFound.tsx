
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Oops! Page not found</p>
        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for ({location.pathname}) doesn't exist or has been moved.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/">
            <Button className="w-full">Return to Home</Button>
          </Link>
          <Link to="/itinerary">
            <Button variant="outline" className="w-full">Go to Itinerary Planner</Button>
          </Link>
        </div>
        <div className="mt-6 text-xs text-gray-400">
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  );
};

export default NotFound;
