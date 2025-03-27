
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Edit, Trash2, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from '@/components/Navbar';

interface SavedItinerary {
  id: string;
  title: string;
  days: number;
  start_date: string | null;
  pace: string | null;
  budget: string | null;
  created_at: string;
  activities_count: number;
}

const SavedItineraries = () => {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_itineraries')
          .select(`
            id, 
            title, 
            days, 
            start_date, 
            pace, 
            budget, 
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // For each itinerary, get the count of activities
        if (data) {
          const itinerariesWithCounts = await Promise.all(
            data.map(async (itinerary) => {
              const { count, error: countError } = await supabase
                .from('itinerary_activities')
                .select('*', { count: 'exact', head: true })
                .eq('itinerary_id', itinerary.id);

              if (countError) throw countError;

              return {
                ...itinerary,
                activities_count: count || 0
              };
            })
          );

          setItineraries(itinerariesWithCounts);
        }
      } catch (error: any) {
        console.error('Error fetching itineraries:', error);
        toast({
          title: "Error fetching itineraries",
          description: error.message || "Could not load your saved itineraries.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [user, toast]);

  const handleDeleteItinerary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_itineraries')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setItineraries(itineraries.filter(itinerary => itinerary.id !== id));
      
      toast({
        title: "Itinerary deleted",
        description: "Your itinerary has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting itinerary:', error);
      toast({
        title: "Error deleting itinerary",
        description: error.message || "Could not delete the itinerary.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Itineraries</h1>
              <p className="text-muted-foreground mt-1">
                View, edit or delete your saved travel plans
              </p>
            </div>
            
            <Link to="/itinerary">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Itinerary
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="bg-muted/30 rounded-xl p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Itineraries Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't created any itineraries yet. Start planning your perfect Navi Mumbai exploration now!
              </p>
              <Link to="/itinerary">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Itinerary
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((itinerary) => (
                <Card key={itinerary.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-navi-blue to-navi-teal text-white">
                    <CardTitle className="truncate">{itinerary.title}</CardTitle>
                    <CardDescription className="text-white/80 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(itinerary.start_date)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{itinerary.days} days</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pace:</span>
                        <span className="font-medium capitalize">{itinerary.pace || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium capitalize">{itinerary.budget || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Activities:</span>
                        <span className="font-medium">{itinerary.activities_count}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t p-4">
                    <Link to={`/itinerary?id=${itinerary.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        View & Edit
                      </Button>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your itinerary "{itinerary.title}" and all its activities. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteItinerary(itinerary.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedItineraries;
