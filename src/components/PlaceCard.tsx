import { useEffect, useState } from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState(image);

  useEffect(() => {
    // Reset loading state when image changes
    setLoaded(false);
    setError(false);
    setFinalImageUrl(image);
    
    const img = new Image();
    img.src = image;
    
    img.onload = () => {
      setLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      console.log(`Error loading image for: ${name}`);
      setError(true);
      // Attempt to find a better image using our config
      fetchBetterImage();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [image, name]);

  const fetchBetterImage = async () => {
    try {
      // Build a search query based on place details for context
      const searchQuery = `${name} ${category} ${location} landmark site`;
      
      // Use the fallback image directly based on the category
      const fallbackImage = getFallbackImage();
      setFinalImageUrl(fallbackImage);
      setLoaded(true);
    } catch (err) {
      console.error("Error fetching better image:", err);
      // Use the fallback system if the API fails
      setFinalImageUrl(getFallbackImage());
      setLoaded(true);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onFavoriteToggle) {
      onFavoriteToggle(id);
    }
  };

  // Function to generate a fallback image based on the category or location name
  const getFallbackImage = () => {
    // Category-specific image mapping
    const categoryImages: Record<string, string> = {
      "Parks & Gardens": "https://images.unsplash.com/photo-1584479898061-15742e14f50d?ixlib=rb-4.0.3&q=80&w=800",
      "Natural Attractions": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&q=80&w=800",
      "Shopping": "https://images.unsplash.com/photo-1605267994962-015b59d59ea9?ixlib=rb-4.0.3&q=80&w=800",
      "Historical Sites": "https://images.unsplash.com/photo-1561361058-c12e14fc165e?ixlib=rb-4.0.3&q=80&w=800",
      "Religious Sites": "https://images.unsplash.com/photo-1561361058-c12e14fc165e?ixlib=rb-4.0.3&q=80&w=800",
      "Sports": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&q=80&w=800",
      "Wildlife": "https://images.unsplash.com/photo-1564171149171-88ba9136cdc8?ixlib=rb-4.0.3&q=80&w=800", 
      "Educational": "https://images.unsplash.com/photo-1576086135878-bd1e26313586?ixlib=rb-4.0.3&q=80&w=800",
      "Amusement": "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?ixlib=rb-4.0.3&q=80&w=800",
      "Cultural": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&q=80&w=800",
      "Food & Dining": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&q=80&w=800",
      "Entertainment": "https://images.unsplash.com/photo-1603739903239-8b6e64c3b185?ixlib=rb-4.0.3&q=80&w=800",
      "Landmark": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&q=80&w=800",
      "Landmarks": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&q=80&w=800",
      "Waterfront": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&q=80&w=800",
      "Museum": "https://images.unsplash.com/photo-1554907984-153a35182a04?ixlib=rb-4.0.3&q=80&w=800"
    };
    
    // Updated specific location images with higher quality ones
    const specificLocationImages: Record<string, string> = {
      "Nerul Balaji Temple": "https://images.unsplash.com/photo-1602526432604-029a709e131c?q=80&w=800",
      // Updated Flamingo Sanctuary image as requested
      "Flamingo Sanctuary": "https://dbdzm869oupei.cloudfront.net/img/photomural/preview/57085.png", 
      "Science Centre": "https://images.unsplash.com/photo-1576086135878-bd1e26313586?q=80&w=800",
      "Raghuleela Mall": "https://images.unsplash.com/photo-1567958451986-2de427a3a0fc?q=80&w=800",
      "Belapur Fort": "https://images.unsplash.com/photo-1599408587288-6f9ef85db0ab?q=80&w=800",
      // Updated Inorbit Mall image as requested
      "Inorbit Mall": "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?q=80&w=800",
      "DLF Mall": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800",
      "Vashi": "https://images.unsplash.com/photo-1599359969577-a5611718a25e?q=80&w=800",
      "Belapur": "https://images.unsplash.com/photo-1599408587288-6f9ef85db0ab?q=80&w=800",
      "Kharghar": "https://images.unsplash.com/photo-1506744476757-8407c4647c7f?q=80&w=800",
      "Nerul": "https://images.unsplash.com/photo-1614930337616-72c3f183097f?q=80&w=800",
      "Panvel": "https://images.unsplash.com/photo-1561789474-cb8a3cb4dea9?q=80&w=800",
      "Airoli": "https://images.unsplash.com/photo-1618001789034-25fd141f5ae3?q=80&w=800",
      "DY Patil Stadium": "https://images.unsplash.com/photo-1505307112588-69289757a94c?q=80&w=800",
      // Updated Central Park image as requested
      "Central Park": "https://d3mbwbgtcl4x70.cloudfront.net/Central_Park_Kharghar_774b4a891e.webp",
      "Wonder Park": "https://images.unsplash.com/photo-1617143207675-e7e6371f5f5d?q=80&w=800",
      "Wonders Park": "https://images.unsplash.com/photo-1617143207675-e7e6371f5f5d?q=80&w=800",
      "Mini Seashore": "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=800",
      "APMC Market": "https://images.unsplash.com/photo-1513704519535-f5c81aa78d0d?q=80&w=800",
      "Parsik Hill": "https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=800",
      "Palm Beach Road": "https://images.unsplash.com/photo-1610641818989-bcd0bd756e93?q=80&w=800",
      "Shivaji Park": "https://images.unsplash.com/photo-1521138054413-5a47d349b7af?q=80&w=800",
      "Nerul Lake": "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=800",
      // Updated Pandavkada Falls image as requested
      "Pandavkada Falls": "https://www.tripplatform.com/blog/wp-content/uploads/2016/09/A-view-of-the-fall-from-a-distance.jpg",
      "Kharghar Hills": "https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?q=80&w=800",
      "Kharghar Valley": "https://images.unsplash.com/photo-1565938525338-659bf7ab20da?q=80&w=800",
      "NMMC Butterfly Garden": "https://images.unsplash.com/photo-1606748313289-81f81f9eae50?q=80&w=800",
      "Golf Course": "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800",
      "Seawoods Grand Central Mall": "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?q=80&w=800",
      "Jewel of Navi Mumbai": "https://images.unsplash.com/photo-1584479898061-15742e14f50d?q=80&w=800",
      "Bonsai Garden": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800",
      "Mango Garden": "https://images.unsplash.com/photo-1622944925998-2429e7c6ae91?q=80&w=800",
      "Ulwe Hill": "https://images.unsplash.com/photo-1551978129-b73f45d132eb?q=80&w=800",
      "Vashi Creek Bridge": "https://images.unsplash.com/photo-1559570278-eb8d71d06403?q=80&w=800",
      "CIDCO Exhibition Centre": "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=800",
      "Utsav Chowk": "https://images.unsplash.com/photo-1464207687429-7505649dae38?q=80&w=800",
      "Shilp Gram": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800",
      "Airoli Knowledge Park": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=800"
    };
    
    // Enhanced image search strategy:
    
    // 1. First check for exact name match
    for (const [key, url] of Object.entries(specificLocationImages)) {
      if (name === key) {
        return url;
      }
    }
    
    // 2. Then check for partial name match
    for (const [key, url] of Object.entries(specificLocationImages)) {
      if (
        name.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(name.toLowerCase())
      ) {
        return url;
      }
    }
    
    // 3. Check for location match
    for (const [key, url] of Object.entries(specificLocationImages)) {
      if (
        location.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(location.toLowerCase())
      ) {
        return url;
      }
    }
    
    // 4. Use category as fallback
    if (categoryImages[category]) {
      return categoryImages[category];
    }
    
    // 5. Default fallback
    return "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?q=80&w=800";
  };

  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md",
        featured ? "md:flex-row" : "h-full",
        !loaded && "animate-pulse"
      )}
    >
      <div className={cn(
        "overflow-hidden relative",
        featured ? "md:w-1/2 h-60 md:h-auto" : "h-48"
      )}>
        {!loaded ? (
          <div className="w-full h-full bg-muted"></div>
        ) : (
          <img 
            src={finalImageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.log(`Image error for ${name}, using direct fallback`);
              e.currentTarget.src = getFallbackImage();
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
              onClick={handleFavoriteToggle}
            />
            <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mt-2 space-y-2">
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
