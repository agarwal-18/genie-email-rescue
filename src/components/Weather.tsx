
import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, Loader2, CloudDrizzle, Wind, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Simulated weather data with location-specific patterns (not real weather data)
const getWeatherData = (location: string): WeatherData => {
  // Create a deterministic but location-specific hash
  const hash = Array.from(location).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use the hash to create deterministic but different weather for each location
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Drizzle', 'Windy'];
  const index = hash % conditions.length;
  const condition = conditions[index];
  
  // Temperature is 25-35°C, but varies by location
  const tempBase = 25 + (hash % 10);
  const temperature = tempBase;
  
  // Humidity is 50-80%, but varies by location
  const humidity = 50 + (hash % 30);
  
  // Wind speed is 5-25 km/h, but varies by location
  const windSpeed = 5 + (hash % 20);
  
  let icon;
  switch (condition) {
    case 'Sunny':
      icon = <Sun className="h-8 w-8 text-yellow-500" />;
      break;
    case 'Partly Cloudy':
      icon = <CloudSun className="h-8 w-8 text-blue-400" />;
      break;
    case 'Cloudy':
      icon = <Cloud className="h-8 w-8 text-gray-400" />;
      break;
    case 'Rainy':
      icon = <CloudRain className="h-8 w-8 text-blue-600" />;
      break;
    case 'Drizzle':
      icon = <CloudDrizzle className="h-8 w-8 text-blue-400" />;
      break;
    case 'Windy':
      icon = <Wind className="h-8 w-8 text-gray-500" />;
      break;
    default:
      icon = <Sun className="h-8 w-8 text-yellow-500" />;
  }
  
  return {
    condition,
    temperature,
    humidity,
    windSpeed,
    icon
  };
};

const Weather = ({ location, className }: WeatherProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset for new location
    setLoading(true);
    
    // Simulate API call with a short delay
    const timer = setTimeout(() => {
      setWeather(getWeatherData(location));
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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
                  <p className="text-xs">This is simulated weather data for demonstration purposes</p>
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
