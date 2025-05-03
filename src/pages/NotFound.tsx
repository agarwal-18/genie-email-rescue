import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "@/config";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page if the route is not valid
    if (!API_CONFIG.validRoutes.includes(window.location.pathname)) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for does not exist.
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Go to Home
      </button>
    </div>
  );
};

export default NotFound;
