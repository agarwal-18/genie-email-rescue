import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { toast as sonnerToast } from "sonner";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { API_CONFIG } from '@/config';
import axios from 'axios';

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
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Setup axios instance with authorization headers
  const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add auth token to requests when available
  useEffect(() => {
    if (session?.access_token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [session]);

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

      const response = await apiClient.get('/itineraries');
      const data = response.data;

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

      const response = await apiClient.get(`/itineraries/${id}`);
      const data = response.data;

      return data;
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

      await apiClient.delete(`/itineraries/${id}`);
      
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
      
      // Convert start date to ISO string for database storage
      const startDateIso = itineraryData.start_date ? itineraryData.start_date.toISOString() : null;
      
      // Prepare data for the API
      const payload = {
        title: itineraryData.title,
        days: itineraryData.days,
        start_date: startDateIso,
        pace: itineraryData.pace,
        budget: itineraryData.budget,
        interests: itineraryData.interests,
        transportation: itineraryData.transportation,
        include_food: itineraryData.include_food
      };
      
      const response = await apiClient.post('/itineraries', {
        ...payload,
        days: itinerary
      });
      
      console.log("Itinerary saved successfully:", response.data);
      
      // Refresh the itineraries list
      await fetchItineraries();
      
      toast({
        title: "Itinerary saved",
        description: "Your itinerary has been saved successfully."
      });
      
      return true;
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
      
      // Convert start date to ISO string for database storage
      const startDateIso = itineraryData.start_date ? itineraryData.start_date.toISOString() : null;
      
      // Prepare data for the API
      const payload = {
        title: itineraryData.title,
        days: itineraryData.days,
        start_date: startDateIso,
        pace: itineraryData.pace,
        budget: itineraryData.budget,
        interests: itineraryData.interests,
        transportation: itineraryData.transportation,
        include_food: itineraryData.include_food
      };
      
      await apiClient.put(`/itineraries/${id}`, {
        ...payload,
        days: itinerary
      });
      
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
