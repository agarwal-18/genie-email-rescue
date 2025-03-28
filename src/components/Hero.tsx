
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

const Hero = ({ title, subtitle, ctaText, ctaLink, imageUrl }: HeroProps) => {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={imageUrl} 
          alt="Travel background" 
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20 w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-right">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl animate-fade-right animate-delay-100">
            {subtitle}
          </p>
          <div className="animate-fade-up animate-delay-200">
            <Link to={ctaLink}>
              <Button size="lg" className="text-base">
                {ctaText}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
