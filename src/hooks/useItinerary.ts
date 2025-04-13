
import { useState } from 'react';
import { supabase, type UserItinerary } from '@/integrations/supabase/client';
// Use a different name for the imported type to avoid conflicts
import type { ItineraryActivity as IActivity } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Local type definition that won't conflict with imported one
type ItineraryDay = {
  day: number;
  activities: IActivity[];
};

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

  // Add missing functions that were causing build errors
  
  const saveItinerary = async (itinerary: Omit<UserItinerary, 'id' | 'created_at' | 'updated_at'>, activities: Omit<IActivity, 'id' | 'created_at'>[]): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      // First create the itinerary
      const newItinerary = await createUserItinerary(itinerary);
      
      if (!newItinerary) {
        throw new Error('Failed to create itinerary');
      }
      
      // Then create all activities
      const activityPromises = activities.map(activity => 
        createItineraryActivity({
          ...activity,
          itinerary_id: newItinerary.id
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
  
  const fetchItineraryById = async (id: string): Promise<{itinerary: UserItinerary | null, activities: ItineraryDay[]}> => {
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
        itinerary: itineraryData,
        activities
      };
    } catch (err: any) {
      setError(err.message);
      return {
        itinerary: null,
        activities: []
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
  
  const downloadItineraryAsPdf = async (elementId: string, fileName: string = 'itinerary.pdf'): Promise<boolean> => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add new pages if the content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
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
