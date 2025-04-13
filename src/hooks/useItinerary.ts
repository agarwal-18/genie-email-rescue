import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { toast as sonnerToast } from "sonner";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { API_CONFIG } from '@/config';
import axios from 'axios';
import { UserItinerary, ItineraryActivity } from '@/integrations/supabase/client';

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

type SavedItinerary = UserItinerary;

export function useItinerary() {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

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
      
      const startDateIso = itineraryData.start_date ? itineraryData.start_date.toISOString() : null;
      
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
      
      const startDateIso = itineraryData.start_date ? itineraryData.start_date.toISOString() : null;
      
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
      
      if (!element) {
        throw new Error("Could not find the itinerary content element");
      }
      
      console.log("Found element to capture for PDF");
      
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '-9999px';
      clone.style.width = element.offsetWidth + 'px';
      document.body.appendChild(clone);
      
      const tabPanels = clone.querySelectorAll('[role="tabpanel"]');
      
      tabPanels.forEach((panel) => {
        (panel as HTMLElement).style.display = 'block';
        (panel as HTMLElement).style.position = 'static';
        (panel as HTMLElement).style.visibility = 'visible';
        (panel as HTMLElement).style.opacity = '1';
        (panel as HTMLElement).style.height = 'auto';
        (panel as HTMLElement).style.overflow = 'visible';
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      pdf.setFontSize(18);
      pdf.text(itineraryData.title, margin, margin + 10);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, margin + 20);
      
      for (let dayIndex = 0; dayIndex < itinerary.length; dayIndex++) {
        const day = itinerary[dayIndex];
        
        if (dayIndex > 0) {
          pdf.addPage();
        }
        
        pdf.setFontSize(16);
        pdf.text(`Day ${day.day}`, margin, margin + 35);
        
        let yOffset = margin + 45;
        
        for (const activity of day.activities) {
          if (yOffset > pageHeight - margin * 2) {
            pdf.addPage();
            yOffset = margin + 10;
          }
          
          pdf.setFontSize(12);
          pdf.setTextColor(100, 100, 100);
          pdf.text(activity.time, margin, yOffset);
          yOffset += 7;
          
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(activity.title, margin, yOffset);
          yOffset += 7;
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Location: ${activity.location}`, margin, yOffset);
          yOffset += 7;
          
          const descriptionLines = pdf.splitTextToSize(activity.description, pageWidth - margin * 2);
          pdf.text(descriptionLines, margin, yOffset);
          yOffset += descriptionLines.length * 5 + 7;
          
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yOffset - 3, pageWidth - margin, yOffset - 3);
          yOffset += 10;
        }
      }
      
      document.body.removeChild(clone);
      
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
