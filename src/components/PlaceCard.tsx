
import { useEffect, useState } from 'react';
import { Star, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlaceCardProps {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  duration?: string;
  location: string;
  featured?: boolean;
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
  featured = false 
}: PlaceCardProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => setLoaded(true);
  }, [image]);

  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md",
        featured ? "md:flex-row" : "h-full",
        !loaded && "animate-pulse"
      )}
    >
      <div className={cn(
        "overflow-hidden",
        featured ? "md:w-1/2 h-60 md:h-auto" : "h-48"
      )}>
        {loaded ? (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted"></div>
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
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
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
        
        <div className="mt-auto pt-4">
          <Button size="sm" variant="outline" className="w-full text-xs">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
