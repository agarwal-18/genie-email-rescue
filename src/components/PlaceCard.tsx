
import { useEffect, useState } from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_CONFIG } from '@/config';

interface PlaceCardProps {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  duration?: string;
  location: string;
  featured?: boolean;
  onFavoriteToggle?: (id: string) => void;
  isFavorite?: boolean;
}

const PlaceCard = ({ 
  id, 
  name, 
  category, 
  description, 
  image, 
  rating, 
  duration, 
  location,
  featured = false,
  onFavoriteToggle,
  isFavorite = false
}: PlaceCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(image);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = API_CONFIG.imageLoadRetries || 2;

  useEffect(() => {
    // Reset states when image prop changes
    setIsLoading(true);
    setImageError(false);
    setRetryCount(0);
    setImageUrl(image);
    
    const preloadImage = new Image();
    preloadImage.src = image;
    
    preloadImage.onload = () => {
      setIsLoading(false);
    };
    
    preloadImage.onerror = () => {
      if (retryCount < maxRetries) {
        // Retry loading with a small delay
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          preloadImage.src = image + '?retry=' + (retryCount + 1);
        }, 1000);
      } else {
        setImageError(true);
        const fallbackUrl = getFallbackImage();
        setImageUrl(fallbackUrl);
        setIsLoading(false);
      }
    };

    return () => {
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [image, retryCount, name]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onFavoriteToggle) {
      onFavoriteToggle(id);
    }
  };

  // Function to generate a fallback image based on the category or location name
  const getFallbackImage = () => {
    // Specific place name mappings for accurate images
    const placeSpecificImages: Record<string, string> = {
      "DY Patil Stadium": "/images/dy-patil-stadium.jpg",
      "Central Park": "/images/central-park.jpg",
      "Wonders Park": "/images/wonders-park.jpg",
      "Wonder Park": "/images/wonders-park.jpg",
      "Nerul Balaji Temple": "/images/nerul-balaji-temple.jpg",
      "Flamingo Sanctuary": "/images/flamingo-sanctuary.jpg", 
      "Science Centre": "/images/science-centre.jpg",
      "Raghuleela Mall": "/images/raghuleela-mall.jpg",
      "Belapur Fort": "/images/belapur-fort.jpg",
      "Inorbit Mall": "/images/inorbit-mall.jpg",
      "DLF Mall": "/images/dlf-mall.jpg",
      "APMC Market": "/images/apmc-market.jpg",
      "Parsik Hill": "/images/parsik-hill.jpg",
      "Palm Beach Road": "/images/palm-beach-road.jpg",
      "Shivaji Park": "/images/shivaji-park.jpg",
      "Nerul Lake": "/images/nerul-lake.jpg",
      "Pandavkada Falls": "/images/pandavkada-falls.jpg",
      "Kharghar Hills": "/images/kharghar-hills.jpg",
      "Kharghar Valley": "/images/kharghar-valley.jpg",
      "NMMC Butterfly Garden": "/images/butterfly-garden.jpg",
      "Golf Course": "/images/golf-course.jpg",
      "Seawoods Grand Central Mall": "/images/seawoods-mall.jpg"
    };
    
    // Location-based images
    const locationImages: Record<string, string> = {
      "Vashi": "/images/vashi.jpg",
      "Belapur": "/images/belapur.jpg",
      "Kharghar": "/images/kharghar.jpg",
      "Nerul": "/images/nerul.jpg",
      "Panvel": "/images/panvel.jpg",
      "Airoli": "/images/airoli.jpg"
    };
    
    // Category-specific image mapping
    const categoryImages: Record<string, string> = {
      "Parks & Gardens": "/images/parks.jpg",
      "Natural Attractions": "/images/nature.jpg",
      "Shopping": "/images/shopping.jpg",
      "Historical Sites": "/images/historical.jpg",
      "Religious Sites": "/images/religious.jpg",
      "Sports": "/images/sports.jpg",
      "Wildlife": "/images/wildlife.jpg", 
      "Educational": "/images/educational.jpg",
      "Amusement": "/images/amusement.jpg",
      "Cultural": "/images/cultural.jpg",
      "Food & Dining": "/images/food.jpg",
      "Entertainment": "/images/entertainment.jpg",
      "Landmark": "/images/landmark.jpg",
      "Landmarks": "/images/landmark.jpg",
      "Waterfront": "/images/waterfront.jpg",
      "Museum": "/images/museum.jpg"
    };
    
    // Enhanced image search strategy:
    
    // 1. First check for exact place name match
    if (placeSpecificImages[name]) {
      return placeSpecificImages[name];
    }
    
    // 2. Then check for partial name match
    for (const [key, url] of Object.entries(placeSpecificImages)) {
      if (name.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(name.toLowerCase())) {
        return url;
      }
    }
    
    // 3. Check for location match
    if (locationImages[location]) {
      return locationImages[location];
    }
    
    // 4. Use category as fallback
    if (categoryImages[category]) {
      return categoryImages[category];
    }
    
    // 5. Default fallback from config
    return API_CONFIG.defaultPlaceImage;
  };

  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md",
        featured ? "md:flex-row" : "h-full"
      )}
    >
      <div className={cn(
        "overflow-hidden relative",
        featured ? "md:w-1/2 h-60 md:h-auto" : "h-48"
      )}>
        {isLoading ? (
          <div className="w-full h-full bg-muted animate-pulse"></div>
        ) : (
          <img 
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
            onError={() => {
              // This is a backup if the preloading failed
              if (!imageError) {
                setImageError(true);
                setImageUrl(getFallbackImage());
              }
            }}
          />
        )}
      </div>
      
      <div className={cn(
        "flex-1 flex flex-col p-4",
        featured ? "md:p-6" : ""
      )}>
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary mb-2">
              {category}
            </span>
            <h3 className={cn(
              "font-semibold line-clamp-1",
              featured ? "text-xl" : "text-lg"
            )}>
              {name}
            </h3>
          </div>
          <div className="flex items-center">
            <Star 
              className={cn(
                "w-5 h-5 cursor-pointer", 
                isFavorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
              )} 
              onClick={handleFavoriteClick}
            />
            <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-2 space-y-2 flex-grow">
          <p className={cn(
            "text-muted-foreground text-sm",
            featured ? "line-clamp-3" : "line-clamp-2"
          )}>
            {description}
          </p>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
          
          {duration && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span>{duration}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
