
import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSun, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

// Mock weather data generator for demo purposes
const getWeatherData = (location: string): WeatherData => {
  // In a real app, this would be an API call to a weather service
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
  const randomIndex = Math.floor(Math.random() * conditions.length);
  const condition = conditions[randomIndex];
  
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
    default:
      icon = <Sun className="h-8 w-8 text-yellow-500" />;
  }
  
  return {
    condition,
    temperature: Math.floor(Math.random() * 10) + 25, // 25-35°C
    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
    windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
    icon
  };
};

const Weather = ({ location, className }: WeatherProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setWeather(getWeatherData(location));
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-primary/5 p-4">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Current Weather in {location}</span>
          {weather && weather.icon}
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
