
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ItineraryActivity {
  time: string;
  title: string;
  location: string;
  description: string;
  image?: string;
  category: string;
}

interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}

interface SavedItinerary {
  id: string;
  title: string;
  days: number;
  start_date: string | null;
  pace: string | null;
  budget: string | null;
  interests: string[] | null;
  transportation: string | null;
  include_food: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useItinerary() {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItineraries = async () => {
    if (!user) {
      setItineraries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setItineraries(data || []);
    } catch (err: any) {
      console.error('Error fetching itineraries:', err);
      setError(err.message);
      toast({
        title: "Error fetching itineraries",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchItineraryById = async (id: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      // Get the itinerary details
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('user_itineraries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (itineraryError) throw itineraryError;

      // Get the activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('itinerary_activities')
        .select('*')
        .eq('itinerary_id', id)
        .order('day', { ascending: true })
        .order('time', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Format the data
      const days: { [key: number]: ItineraryDay } = {};
      
      (activitiesData || []).forEach(activity => {
        if (!days[activity.day]) {
          days[activity.day] = {
            day: activity.day,
            activities: []
          };
        }
        
        days[activity.day].activities.push({
          time: activity.time,
          title: activity.title,
          location: activity.location,
          description: activity.description || '',
          image: activity.image,
          category: activity.category || ''
        });
      });
      
      const formattedItinerary = Object.values(days).sort((a, b) => a.day - b.day);

      return {
        details: itineraryData,
        days: formattedItinerary
      };
    } catch (err: any) {
      console.error('Error fetching itinerary by ID:', err);
      setError(err.message);
      toast({
        title: "Error fetching itinerary",
        description: err.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItinerary = async (id: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('user_itineraries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update the local state
      setItineraries(itineraries.filter(item => item.id !== id));
      
      toast({
        title: "Itinerary deleted",
        description: "Your itinerary has been deleted successfully."
      });

      return true;
    } catch (err: any) {
      console.error('Error deleting itinerary:', err);
      setError(err.message);
      toast({
        title: "Error deleting itinerary",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchItineraries();
    } else {
      setItineraries([]);
      setLoading(false);
    }
  }, [user]);

  return {
    itineraries,
    loading,
    error,
    refreshItineraries: fetchItineraries,
    fetchItineraryById,
    deleteItinerary
  };
}
