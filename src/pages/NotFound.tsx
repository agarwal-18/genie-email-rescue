
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [isVerificationError, setIsVerificationError] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Check if this is a failed email verification
    if (location.pathname.includes("/verify") || 
        location.search.includes("type=email") || 
        location.search.includes("error=") ||
        document.referrer.includes("email")) {
      setIsVerificationError(true);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
              {isVerificationError 
                ? "Email Verification Failed" 
                : "Oops! We couldn't find the page you're looking for."}
            </p>
            
            <div className="mb-8">
              {isVerificationError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Verification Issue</span>
                  </div>
                  <p className="text-left">
                    There was a problem with your email verification link. This may be because:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-left space-y-1">
                    <li>The verification link has expired</li>
                    <li>The link was already used</li>
                    <li>The URL was changed or incomplete</li>
                  </ul>
                  <p className="mt-3 text-left">
                    Please try logging in or request a new verification email.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    The page at <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.pathname}</span> doesn't exist.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Debug Info: Attempted to access path: "{location.pathname}". Available routes include: "/", "/login", "/register", "/itinerary", "/planner", etc.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" className="w-full sm:w-auto">
                <Link to="/" className="flex items-center justify-center">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
              
              {isVerificationError ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to="/login" className="flex items-center justify-center">
                    Try Logging In
                  </Link>
                </Button>
              ) : (
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
              )}
              
              {!isVerificationError && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to="/planner" className="flex items-center justify-center">
                    Try Planner Page
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
