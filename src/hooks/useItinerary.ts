
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
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
      
      // Convert start date to ISO string for database storage
      const startDateIso = itineraryData.start_date ? itineraryData.start_date.toISOString() : null;
      
      // Create the itinerary data object without the locations field
      const itineraryInsertData = {
        user_id: user.id,
        title: itineraryData.title,
        days: itineraryData.days,
        start_date: startDateIso,
        pace: itineraryData.pace,
        budget: itineraryData.budget,
        interests: itineraryData.interests,
        transportation: itineraryData.transportation,
        include_food: itineraryData.include_food
      };
      
      // Save the itinerary without the locations field
      const { data: savedItinerary, error: itineraryError } = await supabase
        .from('user_itineraries')
        .insert(itineraryInsertData)
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

  const updateItinerary = async (
    id: string,
    itineraryData: {
      title: string;
      days: number;
      start_date?: Date;
      pace: string;
      budget: string;
      interests: string[];
      transportation: string;
      include_food: boolean;
    },
    itinerary: ItineraryDay[]
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update your itinerary.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setLoading(true);
      console.log("Starting itinerary update process...");
      console.log("User:", user.id);
      console.log("Itinerary ID:", id);
      console.log("Itinerary title:", itineraryData.title);
      
      // Convert start date to ISO string for database storage
      const startDateIso = itineraryData.start_date ? itineraryData.start_date.toISOString() : null;
      
      // Update the itinerary
      const { error: itineraryError } = await supabase
        .from('user_itineraries')
        .update({
          title: itineraryData.title,
          days: itineraryData.days,
          start_date: startDateIso,
          pace: itineraryData.pace,
          budget: itineraryData.budget,
          interests: itineraryData.interests,
          transportation: itineraryData.transportation,
          include_food: itineraryData.include_food,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (itineraryError) {
        console.error("Error updating itinerary:", itineraryError);
        throw itineraryError;
      }
      
      // Delete existing activities
      const { error: deleteActivitiesError } = await supabase
        .from('itinerary_activities')
        .delete()
        .eq('itinerary_id', id);
      
      if (deleteActivitiesError) {
        console.error("Error deleting activities:", deleteActivitiesError);
        throw deleteActivitiesError;
      }
      
      // Save new activities
      const activitiesData = itinerary.flatMap((day) => 
        day.activities.map((activity) => ({
          itinerary_id: id,
          day: day.day,
          time: activity.time,
          title: activity.title,
          location: activity.location,
          description: activity.description || null,
          image: activity.image || null,
          category: activity.category || null
        }))
      );
      
      const { error: activitiesError } = await supabase
        .from('itinerary_activities')
        .insert(activitiesData);
      
      if (activitiesError) {
        console.error("Error saving activities:", activitiesError);
        throw activitiesError;
      }
      
      // Refresh the itineraries list
      await fetchItineraries();
      
      toast({
        title: "Itinerary updated",
        description: "Your itinerary has been updated successfully."
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating itinerary:', err);
      toast({
        title: "Error updating itinerary",
        description: err.message || "There was an error updating your itinerary.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const downloadItineraryAsPdf = async (
    itineraryData: {
      title: string;
      days: number;
    }, 
    itinerary: ItineraryDay[], 
    element: HTMLElement | null
  ) => {
    try {
      sonnerToast.loading("Generating PDF...");
      
      // Find the element to capture
      if (!element) {
        throw new Error("Could not find the itinerary content element");
      }
      
      console.log("Found element to capture for PDF");
      
      // Create a deep clone of the element to work with
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      clone.style.width = element.offsetWidth + 'px';
      document.body.appendChild(clone);
      
      // Find all tab panels in the clone
      const tabPanels = clone.querySelectorAll('[role="tabpanel"]');
      
      // Make all tab panels visible
      tabPanels.forEach((panel) => {
        (panel as HTMLElement).style.display = 'block';
        (panel as HTMLElement).style.position = 'static';
        (panel as HTMLElement).style.visibility = 'visible';
        (panel as HTMLElement).style.opacity = '1';
        (panel as HTMLElement).style.height = 'auto';
        (panel as HTMLElement).style.overflow = 'visible';
      });
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      // Add title to first page
      pdf.setFontSize(18);
      pdf.text(itineraryData.title, margin, margin + 10);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, margin + 20);
      
      // Process each day separately
      for (let dayIndex = 0; dayIndex < itinerary.length; dayIndex++) {
        const day = itinerary[dayIndex];
        
        // Add a new page for each day except the first one
        if (dayIndex > 0) {
          pdf.addPage();
        }
        
        // Add day header
        pdf.setFontSize(16);
        pdf.text(`Day ${day.day}`, margin, margin + 35);
        
        let yOffset = margin + 45;
        
        // Process each activity in the day
        for (const activity of day.activities) {
          // Check if we need to start a new page
          if (yOffset > pageHeight - margin * 2) {
            pdf.addPage();
            yOffset = margin + 10;
          }
          
          // Activity time
          pdf.setFontSize(12);
          pdf.setTextColor(100, 100, 100);
          pdf.text(activity.time, margin, yOffset);
          yOffset += 7;
          
          // Activity title
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(activity.title, margin, yOffset);
          yOffset += 7;
          
          // Activity location
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Location: ${activity.location}`, margin, yOffset);
          yOffset += 7;
          
          // Activity description - handle text wrapping
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const descriptionLines = pdf.splitTextToSize(activity.description, pageWidth - margin * 2);
          pdf.text(descriptionLines, margin, yOffset);
          yOffset += descriptionLines.length * 5 + 7;
          
          // Add a separator line
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yOffset - 3, pageWidth - margin, yOffset - 3);
          yOffset += 10;
        }
      }
      
      // Remove the clone from document
      document.body.removeChild(clone);
      
      // Save the PDF
      const fileName = `${itineraryData.title.replace(/\s+/g, '_')}_itinerary.pdf`;
      pdf.save(fileName);
      
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
    updateItinerary,
    downloadItineraryAsPdf
  };
}
