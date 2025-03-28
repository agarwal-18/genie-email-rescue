
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

const FeatureCard = ({ icon: Icon, title, description, buttonText, buttonLink }: FeatureCardProps) => {
  return (
    <div className="glass hover-scale p-6 rounded-xl">
      <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {buttonText && buttonLink && (
        <Link to={buttonLink}>
          <Button variant="outline" size="sm">
            {buttonText}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default FeatureCard;
