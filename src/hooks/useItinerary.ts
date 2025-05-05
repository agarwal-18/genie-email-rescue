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
  
  // Completely rewritten PDF generation function to handle all days serially
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

      // Create PDF document with better quality settings
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
      
      // Set font styles for title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      
      // Add main title at the top of the first page
      pdf.text(itineraryInfo.title, pageWidth / 2, margin, { align: 'center' });
      
      // Add date with smaller font
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, margin + 8, { align: 'center' });
      
      // Add number of days info
      pdf.text(`${itineraryDays.length} day itinerary`, pageWidth / 2, margin + 14, { align: 'center' });
      
      // Get all day tabs to click on them
      const dayTabs = Array.from(element.querySelectorAll('[role="tab"]')) as HTMLElement[];
      
      if (!dayTabs.length) {
        console.error('No day tabs found');
        throw new Error('Could not find day tabs for PDF generation');
      }
      
      console.log(`Found ${dayTabs.length} day tabs for PDF generation`);
      
      // Start position for content after the header
      let yPosition = margin + 20;
      let currentPage = 1;
      
      // Process each day sequentially
      for (let i = 0; i < itineraryDays.length; i++) {
        const day = itineraryDays[i];
        
        // Check if we need to add a new page
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
        
        try {
          // Click on the specific day tab to make it visible
          if (dayTabs[i]) {
            dayTabs[i].click();
            // Wait for the tab content to render and animations to complete
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          // Find the currently active tab content
          const activeTabContent = element.querySelector('[data-state="active"][role="tabpanel"]');
          
          if (activeTabContent) {
            console.log(`Capturing content for Day ${day.day}`);
            
            // Capture the tab content with better scale for higher quality
            const canvas = await html2canvas(activeTabContent as HTMLElement, {
              scale: 3, // Higher scale for better quality
              logging: false,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Calculate image dimensions while maintaining aspect ratio
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Check if image would go beyond page boundary
            if (yPosition + imgHeight > pageHeight - margin) {
              // Add a new page if the image doesn't fit
              pdf.addPage();
              currentPage++;
              yPosition = margin; // Reset Y position for new page
            }
            
            // Add the image
            pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            
            // Update Y position for next content
            yPosition += imgHeight + 15;
            
            // Add page number at the bottom
            pdf.setFontSize(10);
            pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          } else {
            console.error(`No active content found for Day ${day.day}`);
            // Add error message in the PDF
            pdf.setFontSize(12);
            pdf.setTextColor(255, 0, 0);
            pdf.text(`Error: Could not capture content for Day ${day.day}`, margin, yPosition);
            yPosition += 10;
            pdf.setTextColor(0, 0, 0); // Reset text color
          }
        } catch (err) {
          console.error(`Error capturing day ${day.day}:`, err);
          // Add error message in the PDF
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text(`Error processing Day ${day.day}: ${err}`, margin, yPosition);
          yPosition += 10;
          pdf.setTextColor(0, 0, 0); // Reset text color
        }
      }
      
      // Return to the first tab for UI consistency
      if (dayTabs[0]) {
        dayTabs[0].click();
      }
      
      // Generate a clean filename
      const fileName = `${itineraryInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      pdf.save(fileName);
      
      console.log(`PDF generation completed: ${fileName}`);
      return true;
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    loading,
    error,
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
    downloadItineraryAsPdf
  };
}
