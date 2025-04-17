
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ItineraryGenerator from '@/components/ItineraryGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Planner = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Trip Planner</h1>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ItineraryGenerator />
        </div>
      </div>
    </div>
  );
};

export default Planner;
