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
  
  // Modified downloadItineraryAsPdf function to capture all days at once
  const downloadItineraryAsPdf = async (
    itineraryInfo: { title: string; days: number },
    itineraryDays: ItineraryDay[],
    element: HTMLElement | null
  ): Promise<boolean> => {
    try {
      if (!element) {
        throw new Error('Element not found for PDF generation');
      }
      
      // Create PDF with A4 format (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Capture all days in element
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY
      });
      
      const imgWidth = 190; // A4 width with margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(itineraryInfo.title, 10, 10);
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 10, 20);
      
      // Add content
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 25, imgWidth, imgHeight);
      
      // Add instructions page at the end
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text("Travel Tips & Instructions", 10, 20);
      
      pdf.setFontSize(11);
      pdf.text("1. Arrive 30 minutes early for any scheduled activities", 15, 40);
      pdf.text("2. Keep digital and physical copies of your itinerary", 15, 50);
      pdf.text("3. Check weather forecasts daily and plan accordingly", 15, 60);
      pdf.text("4. Always carry water and stay hydrated", 15, 70);
      pdf.text("5. Be respectful of local customs and traditions", 15, 80);
      pdf.text("6. Have emergency contacts saved on your phone", 15, 90);
      pdf.text("7. Take regular breaks to avoid exhaustion", 15, 100);
      pdf.text("8. Try local cuisine for an authentic experience", 15, 110);
      pdf.text("9. Download offline maps before exploring", 15, 120);
      pdf.text("10. Keep flexible time buffers in your schedule", 15, 130);
      
      pdf.setFontSize(12);
      pdf.text("Enjoy your trip to Navi Mumbai!", 15, 150);
      
      const fileName = `${itineraryInfo.title.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
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
