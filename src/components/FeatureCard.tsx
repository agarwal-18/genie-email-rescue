
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

const FeatureCard = ({ icon: Icon, title, description, buttonText, buttonLink }: FeatureCardProps) => {
  return (
    <Link to={buttonLink || '/'} className="block h-full">
      <div className="glass hover-scale p-6 rounded-xl h-full transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 flex-grow">{description}</p>
        <div className="mt-auto pt-2 inline-flex text-sm font-medium text-primary hover:underline">
          {buttonText || 'Learn more'} →
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
