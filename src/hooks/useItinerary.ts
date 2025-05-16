import { useState } from 'react';
import { supabase, type UserItinerary } from '@/integrations/supabase/client';
// Use a different name for the imported type to avoid conflicts
import type { ItineraryActivity as IActivity } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { API_CONFIG, ItinerarySettings, ItineraryActivityBase, ItineraryDayBase } from '@/config';

// Local type definition that won't conflict with imported one
export type ItineraryDay = {
  day: number;
  activities: ItineraryActivityBase[];
};

export interface ItineraryDetail {
  details: UserItinerary;
  days: ItineraryDay[];
}

export function useItinerary() {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserItineraries = async (userId: string): Promise<UserItinerary[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_itineraries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createUserItinerary = async (itinerary: Omit<UserItinerary, 'id' | 'created_at' | 'updated_at'>): Promise<UserItinerary | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_itineraries')
        .insert([itinerary])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserItinerary = async (id: string, updates: Partial<UserItinerary>): Promise<UserItinerary | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_itineraries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserItinerary = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('user_itineraries')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getItineraryActivities = async (itineraryId: string): Promise<ItineraryDay[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('itinerary_activities')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .order('day', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Group activities by day
      const groupedActivities: { [day: number]: IActivity[] } = {};
      data.forEach((activity: IActivity) => {
        if (!groupedActivities[activity.day]) {
          groupedActivities[activity.day] = [];
        }
        groupedActivities[activity.day].push(activity);
      });

      // Convert grouped activities to the desired format
      const itineraryDays: ItineraryDay[] = Object.entries(groupedActivities).map(([day, activities]) => ({
        day: parseInt(day),
        activities: activities,
      }));

      return itineraryDays;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createItineraryActivity = async (activity: Omit<IActivity, 'id' | 'created_at'>): Promise<IActivity | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('itinerary_activities')
        .insert([activity])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateItineraryActivity = async (id: string, updates: Partial<IActivity>): Promise<IActivity | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('itinerary_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteItineraryActivity = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('itinerary_activities')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const saveItinerary = async (
    settings: ItinerarySettings, 
    activities: Array<{
      day: number;
      time: string;
      title: string;
      location: string;
      description: string | null;
      image: string | null;
      category: string | null;
    }>
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      // Convert settings to UserItinerary format
      const itineraryData: Omit<UserItinerary, 'id' | 'created_at' | 'updated_at'> = {
        title: settings.title,
        days: settings.days,
        start_date: typeof settings.start_date === 'string' ? settings.start_date : null,
        pace: settings.pace || null,
        budget: settings.budget || null,
        interests: settings.interests || null,
        transportation: settings.transportation || null,
        include_food: settings.include_food || false,
        user_id: settings.user_id || ''
      };
      
      // First create the itinerary
      const newItinerary = await createUserItinerary(itineraryData);
      
      if (!newItinerary) {
        throw new Error('Failed to create itinerary');
      }
      
      // Then create all activities
      const activityPromises = activities.map(activity => 
        createItineraryActivity({
          ...activity,
          itinerary_id: newItinerary.id,
        })
      );
      
      await Promise.all(activityPromises);
      
      return newItinerary.id;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const fetchItineraryById = async (id: string): Promise<ItineraryDetail> => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the itinerary
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('user_itineraries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (itineraryError) {
        throw new Error(itineraryError.message);
      }
      
      // Fetch activities
      const activities = await getItineraryActivities(id);
      
      return {
        details: itineraryData,
        days: activities
      };
    } catch (err: any) {
      setError(err.message);
      return {
        details: {} as UserItinerary,
        days: []
      };
    } finally {
      setLoading(false);
    }
  };
  
  const updateItinerary = async (id: string, itinerary: Partial<UserItinerary>, activities?: Omit<IActivity, 'id' | 'created_at'>[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Update the itinerary details
      const { error: updateError } = await supabase
        .from('user_itineraries')
        .update(itinerary)
        .eq('id', id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // If activities are provided, replace all existing activities
      if (activities && activities.length > 0) {
        // First delete all existing activities
        const { error: deleteError } = await supabase
          .from('itinerary_activities')
          .delete()
          .eq('itinerary_id', id);
        
        if (deleteError) {
          throw new Error(deleteError.message);
        }
        
        // Then create new activities
        const activityPromises = activities.map(activity => 
          createItineraryActivity({
            ...activity,
            itinerary_id: id
          })
        );
        
        await Promise.all(activityPromises);
      }
      
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Add the missing generateItinerary function
  const generateItinerary = async (formData: any) => {
    setIsGenerating(true);
    setError(null);
    try {
      // This would typically call an API to generate an itinerary
      // For now, we'll simulate a delay and return a mock itinerary
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extract the number of days from the form data
      const days = formData.days || 3;
      const selectedRegions = formData.regions || [];
      
      // Generate a mock itinerary based on the form data
      const mockItinerary: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        activities: Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, j) => ({
          time: `${8 + j * 2}:00`,
          title: `Activity ${j + 1} in ${selectedRegions.length > 0 ? selectedRegions[0] : 'Maharashtra'}`,
          location: selectedRegions.length > 0 ? selectedRegions[Math.floor(Math.random() * selectedRegions.length)] : 'Maharashtra',
          description: `Enjoy this ${formData.interests ? formData.interests[0] : 'interesting'} activity`,
          image: null,
          category: formData.interests ? formData.interests[0] : null,
        }))
      }));
      
      return mockItinerary;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };
  
  const downloadItineraryAsPdf = async (
    itineraryInfo: { title: string; days: number },
    itineraryDays: ItineraryDay[],
    element: HTMLElement | null
  ): Promise<boolean> => {
    try {
      if (!element) {
        throw new Error('Element not found for PDF generation');
      }
      
      console.log(`Starting PDF generation for ${itineraryDays.length} days`);
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Calculate page dimensions (A4)
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Set font for title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      
      // Add main title
      pdf.text(itineraryInfo.title, pageWidth / 2, margin, { align: 'center' });
      
      // Add generation date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 8, { align: 'center' });
      pdf.text(`${itineraryDays.length} day itinerary`, pageWidth / 2, margin + 14, { align: 'center' });
      
      // Find all day tabs by their role
      const tabsElement = element.querySelector('[role="tablist"]');
      if (!tabsElement) {
        throw new Error('No tabs element found for PDF generation');
      }
      
      // Get all tab triggers
      const tabTriggers = Array.from(tabsElement.querySelectorAll('[role="tab"]')) as HTMLElement[];
      console.log(`Found ${tabTriggers.length} tab triggers`);
      
      if (tabTriggers.length === 0) {
        throw new Error('No day tabs found for PDF generation');
      }
      
      // Starting position after title
      let yPosition = margin + 20;
      let currentPage = 1;
      
      // Process each day one by one
      for (let i = 0; i < itineraryDays.length; i++) {
        const day = itineraryDays[i];
        console.log(`Processing Day ${day.day}`);
        
        // Add new page for each day except the first
        if (i > 0) {
          pdf.addPage();
          currentPage++;
          yPosition = margin; // Reset Y position for new page
        }
        
        // Add day header
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Day ${day.day}`, margin, yPosition + 10);
        
        // Add separator line
        yPosition += 12;
        pdf.setDrawColor(100, 100, 100);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
        
        // Clear any previous click state and click on the current day tab
        const trigger = tabTriggers[i];
        if (!trigger) {
          console.error(`No tab trigger found for Day ${day.day}`);
          continue;
        }
        
        // Click the tab and wait for the UI to update
        console.log(`Clicking tab for Day ${day.day}`);
        trigger.click();
        
        // Wait for the content to appear
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get the active tab panel by querying for the currently active panel
        const activePanel = element.querySelector('[role="tabpanel"][data-state="active"]');
        if (!activePanel) {
          console.error(`No active panel found for Day ${day.day}`);
          continue;
        }
        
        try {
          // Capture the content for this specific day
          console.log(`Capturing content for Day ${day.day}`);
          const canvas = await html2canvas(activePanel as HTMLElement, {
            scale: 3, // Higher scale for better quality
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          
          // Calculate image dimensions
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if image fits on current page
          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            currentPage++;
            yPosition = margin;
          }
          
          // Add image to PDF
          pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
          
          yPosition += imgHeight + 15;
          
          // Add page number
          pdf.setFontSize(10);
          pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          
          console.log(`Added Day ${day.day} content to PDF`);
        } catch (err) {
          console.error(`Error capturing Day ${day.day}:`, err);
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text(`Error capturing content for Day ${day.day}`, margin, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 10;
        }
      }
      
      // Reset to first day tab for better UI experience
      if (tabTriggers[0]) {
        tabTriggers[0].click();
      }
      
      // Generate clean filename
      const fileName = `${itineraryInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      pdf.save(fileName);
      
      console.log(`PDF generation completed successfully`);
      return true;
    } catch (err: any) {
      console.error('PDF generation failed:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    loading,
    error,
    isGenerating,
    getUserItineraries,
    createUserItinerary,
    updateUserItinerary,
    deleteUserItinerary,
    getItineraryActivities,
    createItineraryActivity,
    updateItineraryActivity,
    deleteItineraryActivity,
    saveItinerary,
    fetchItineraryById,
    updateItinerary,
    downloadItineraryAsPdf,
    generateItinerary
  };
}
