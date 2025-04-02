
import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, Loader2, CloudDrizzle, Wind, Info, Snowflake, CloudFog, CloudLightning } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

interface WeatherProps {
  location: string;
  className?: string;
}

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  icon: React.ReactNode;
}

// OpenWeatherMap API key
const API_KEY = "562c360f0d7884a7ec779f34559a11fb";

const Weather = ({ location, className }: WeatherProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to get weather icon based on OpenWeatherMap condition code
  const getWeatherIcon = (weatherId: number) => {
    // Weather condition codes: https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 300) {
      return <CloudLightning className="h-8 w-8 text-yellow-500" />;
    } else if (weatherId >= 300 && weatherId < 400) {
      return <CloudDrizzle className="h-8 w-8 text-blue-400" />;
    } else if (weatherId >= 500 && weatherId < 600) {
      return <CloudRain className="h-8 w-8 text-blue-600" />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <Snowflake className="h-8 w-8 text-blue-200" />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <CloudFog className="h-8 w-8 text-gray-400" />;
    } else if (weatherId === 800) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    } else if (weatherId > 800) {
      return <CloudSun className="h-8 w-8 text-blue-400" />;
    } else {
      return <Cloud className="h-8 w-8 text-gray-400" />;
    }
  };

  // Helper function to convert weather condition code to text
  const getWeatherCondition = (weatherId: number, description: string) => {
    // Capitalize first letter of description
    return description.charAt(0).toUpperCase() + description.slice(1);
  };

  useEffect(() => {
    // Reset for new location
    setLoading(true);
    setError(null);
    
    const fetchWeatherData = async () => {
      try {
        console.log(`Fetching weather for ${location}...`);
        
        // Encode location and add India to improve search results
        const searchLocation = `${location}, Navi Mumbai, India`;
        const encodedLocation = encodeURIComponent(searchLocation);
        
        // Use HTTPS for the API call
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedLocation}&units=metric&appid=${API_KEY}`;
        console.log("Weather API URL:", url);
        
        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, { 
          signal: controller.signal,
          mode: 'cors' // Ensure CORS is enabled
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Weather data received:", data);
        
        // Extract and format relevant weather data
        const weatherData: WeatherData = {
          condition: getWeatherCondition(data.weather[0].id, data.weather[0].description),
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          icon: getWeatherIcon(data.weather[0].id),
        };
        
        setWeather(weatherData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching weather data:", err);
        setError(`Could not fetch weather data for ${location}`);
        setLoading(false);
        
        // Fallback to a default weather if API fails
        setWeather({
          condition: "Partly Cloudy",
          temperature: 28,
          humidity: 65,
          windSpeed: 12,
          icon: <CloudSun className="h-8 w-8 text-blue-400" />
        });
        
        console.log("Using fallback weather data");
        
        // Don't show error toast, just use the fallback silently
        // toast({
        //   title: "Weather data error",
        //   description: `Could not load weather for ${location}. Using default data.`,
        //   variant: "destructive",
        // });
      }
    };
    
    // Only fetch if we have a location
    if (location && location.trim() !== '') {
      fetchWeatherData();
    } else {
      // Handle empty location
      setError("Location not specified");
      setLoading(false);
      
      // Use default data for empty location
      setWeather({
        condition: "Partly Cloudy",
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        icon: <CloudSun className="h-8 w-8 text-blue-400" />
      });
    }
  }, [location]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-primary/5 p-4">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Current Weather in {location}</span>
          <div className="flex items-center">
            {weather && weather.icon}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Weather data from OpenWeatherMap</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-20">
            <p className="text-sm text-muted-foreground">Using default weather data</p>
            {weather && (
              <div className="space-y-2 mt-2 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium">{weather.condition}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="font-medium">{weather.temperature}°C</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Condition</span>
              <span className="font-medium">{weather?.condition}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Temperature</span>
              <span className="font-medium">{weather?.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Humidity</span>
              <span className="font-medium">{weather?.humidity}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Wind</span>
              <span className="font-medium">{weather?.windSpeed} km/h</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Weather;
