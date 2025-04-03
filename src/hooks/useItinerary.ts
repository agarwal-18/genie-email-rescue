
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast as sonnerToast } from "sonner";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
      console.log("Fetching itineraries for user:", user.id);

      const { data, error } = await supabase
        .from('user_itineraries')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      console.log("Fetched itineraries:", data);
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

  const saveItinerary = async (itineraryData: {
    title: string;
    days: number;
    start_date?: Date;
    pace: string;
    budget: string;
    interests: string[];
    transportation: string;
    include_food: boolean;
    locations: string[];
  }, itinerary: ItineraryDay[]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your itinerary.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setLoading(true);
      console.log("Starting itinerary save process...");
      console.log("User:", user.id);
      console.log("Itinerary title:", itineraryData.title);
      console.log("Selected locations:", itineraryData.locations);
      
      // Convert start date to ISO string for database storage
      const startDateIso = itineraryData.start_date ? itineraryData.start_date.toISOString() : null;
      
      // Save the itinerary
      const { data: savedItinerary, error: itineraryError } = await supabase
        .from('user_itineraries')
        .insert({
          user_id: user.id,
          title: itineraryData.title,
          days: itineraryData.days,
          start_date: startDateIso,
          pace: itineraryData.pace,
          budget: itineraryData.budget,
          interests: itineraryData.interests,
          transportation: itineraryData.transportation,
          include_food: itineraryData.include_food,
          locations: itineraryData.locations
        })
        .select()
        .single();
      
      if (itineraryError) {
        console.error("Error saving itinerary:", itineraryError);
        throw itineraryError;
      }
      
      console.log("Itinerary saved successfully:", savedItinerary);
      
      // Save each activity
      if (savedItinerary) {
        console.log("Saving activities for itinerary:", savedItinerary.id);
        
        const activitiesData = itinerary.flatMap((day) => 
          day.activities.map((activity) => ({
            itinerary_id: savedItinerary.id,
            day: day.day,
            time: activity.time,
            title: activity.title,
            location: activity.location,
            description: activity.description || null,
            image: activity.image || null,
            category: activity.category || null
          }))
        );
        
        console.log("Activities to save:", activitiesData.length);
        
        const { error: activitiesError } = await supabase
          .from('itinerary_activities')
          .insert(activitiesData);
        
        if (activitiesError) {
          console.error("Error saving activities:", activitiesError);
          throw activitiesError;
        }
        
        console.log("Activities saved successfully");
        
        // Refresh the itineraries list
        await fetchItineraries();
        
        toast({
          title: "Itinerary saved",
          description: "Your itinerary has been saved successfully."
        });
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error saving itinerary:', err);
      toast({
        title: "Error saving itinerary",
        description: err.message || "There was an error saving your itinerary.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const downloadItineraryAsPdf = async (itineraryData: {
    title: string;
    days: number;
  }, itinerary: ItineraryDay[], elementId: string = 'itinerary-content') => {
    try {
      sonnerToast.loading("Generating PDF...");
      
      // Find the element to capture
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error("Could not find the itinerary content element");
      }
      
      // Use html2canvas to take a screenshot of the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(itineraryData.title, 15, 15);
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 22);
      
      // Add the image to the PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0), 
        'JPEG', 
        0, 
        30, 
        imgWidth, 
        imgHeight
      );
      
      // Save the PDF
      pdf.save(`${itineraryData.title.replace(/\s+/g, '_')}_itinerary.pdf`);
      
      sonnerToast.success("Itinerary downloaded successfully!");
      
      return true;
    } catch (err: any) {
      console.error('Error downloading itinerary:', err);
      sonnerToast.error("Failed to download itinerary: " + (err.message || "Unknown error"));
      return false;
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
    deleteItinerary,
    saveItinerary,
    downloadItineraryAsPdf
  };
}
