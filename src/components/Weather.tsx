
import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Thermometer, Wind, CloudFog, CloudLightning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WeatherProps {
  location: string;
  className?: string;
}

interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  location: string;
  time: string;
}

const Weather = ({ location, className = '' }: WeatherProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching weather for ${location}...`);
        // Format the query to include "India" to improve location accuracy
        const formattedLocation = `${location}, Navi Mumbai, India`;
        const API_KEY = '562c360f0d7884a7ec779f34559a11fb'; // OpenWeatherMap API key
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedLocation)}&units=metric&appid=${API_KEY}`;
        
        console.log('Weather API URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        
        setWeatherData({
          temp: Math.round(data.main.temp),
          tempMin: Math.round(data.main.temp_min),
          tempMax: Math.round(data.main.temp_max),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          windSpeed: data.wind.speed,
          location: data.name,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Could not load weather data. Using fallback data.');
        
        // Use fallback data
        setWeatherData({
          temp: 32,
          tempMin: 30,
          tempMax: 34,
          humidity: 55,
          description: 'partly cloudy',
          icon: '02d',
          windSpeed: 2.5,
          location: location,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
    
    // Refresh weather data every 30 minutes
    const intervalId = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [location]);
  
  // Determine which weather icon to display based on the weather code
  const getWeatherIcon = () => {
    if (!weatherData) return <Cloud className="h-8 w-8" />;
    
    const iconCode = weatherData.icon;
    
    if (iconCode.includes('01')) return <Sun className="h-8 w-8 text-yellow-500" />; // clear
    if (iconCode.includes('02') || iconCode.includes('03')) return <Cloud className="h-8 w-8 text-gray-400" />; // few/scattered clouds
    if (iconCode.includes('04')) return <Cloud className="h-8 w-8 text-gray-600" />; // broken/overcast clouds
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="h-8 w-8 text-blue-500" />; // rain
    if (iconCode.includes('11')) return <CloudLightning className="h-8 w-8 text-purple-500" />; // thunderstorm
    if (iconCode.includes('13')) return <CloudSnow className="h-8 w-8 text-blue-200" />; // snow
    if (iconCode.includes('50')) return <CloudFog className="h-8 w-8 text-gray-400" />; // mist/fog
    
    return <Cloud className="h-8 w-8" />; // default
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : weatherData ? (
          <div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{weatherData.location}</h3>
                <p className="text-xs text-muted-foreground">{weatherData.time}</p>
              </div>
              {getWeatherIcon()}
            </div>
            
            <div className="mt-4 flex items-center">
              <div className="text-4xl font-bold">{weatherData.temp}°C</div>
              <div className="ml-3 space-y-1">
                <div className="flex text-xs items-center">
                  <Thermometer className="h-3 w-3 mr-1" />
                  <span>High: {weatherData.tempMax}°C</span>
                </div>
                <div className="flex text-xs items-center">
                  <Thermometer className="h-3 w-3 mr-1" />
                  <span>Low: {weatherData.tempMin}°C</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center text-sm">
              <div className="flex items-center">
                <Wind className="h-4 w-4 mr-1" />
                <span>{weatherData.windSpeed} m/s</span>
              </div>
              <div className="capitalize">{weatherData.description}</div>
              <div>{weatherData.humidity}% humidity</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32">
            <Cloud className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-center text-muted-foreground">{error}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default Weather;
