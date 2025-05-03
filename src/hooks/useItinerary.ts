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
  
  // Add this new function to properly create PDF with all days
  const downloadItineraryAsPdf = async (
    details: { title: string; days: number },
    itinerary: Array<{ day: number; activities: any[] }>,
    contentRef: HTMLDivElement | null
  ) => {
    try {
      if (!contentRef) {
        console.error('Content reference is missing');
        return false;
      }

      // Create a PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set up document properties
      const title = details.title || 'Navi Mumbai Itinerary';
      doc.setProperties({
        title,
        subject: `${details.days}-Day Itinerary for Navi Mumbai`,
        author: 'Navi Mumbai Travel Planner',
        creator: 'Navi Mumbai Travel App',
      });

      // Helper function to add a new page with header
      const addPageWithHeader = (text: string) => {
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(41, 37, 36); // text-gray-800
        doc.text(text, 20, 20);
        
        // Add a line under the header
        doc.setDrawColor(59, 130, 246); // bg-blue-500
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        
        doc.setFontSize(12);
        doc.setTextColor(75, 85, 99); // text-gray-600
      };

      // Cover page
      doc.setFontSize(24);
      doc.setTextColor(59, 130, 246); // bg-blue-500
      doc.text(title, 20, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(75, 85, 99); // text-gray-600
      doc.text(`${details.days}-Day Itinerary for Navi Mumbai`, 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Created on: ${new Date().toLocaleDateString()}`, 20, 50);

      // Process each day separately
      for (let i = 0; i < itinerary.length; i++) {
        const day = itinerary[i];
        
        // Add a new page for each day with a header
        addPageWithHeader(`Day ${day.day} Schedule`);

        let yPos = 40;
        
        // Process each activity for this day
        for (let j = 0; j < day.activities.length; j++) {
          const activity = day.activities[j];
          
          // Time
          doc.setFontSize(11);
          doc.setTextColor(59, 130, 246); // bg-blue-500
          doc.text(activity.time, 20, yPos);
          yPos += 7;
          
          // Title
          doc.setFontSize(14);
          doc.setTextColor(31, 41, 55); // text-gray-900
          doc.text(activity.title, 20, yPos);
          yPos += 7;
          
          // Location
          doc.setFontSize(10);
          doc.setTextColor(107, 114, 128); // text-gray-500
          doc.text(`Location: ${activity.location}`, 20, yPos);
          yPos += 7;
          
          // Description (with text wrapping)
          if (activity.description) {
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99); // text-gray-600
            
            // Add wrapped text
            const splitText = doc.splitTextToSize(activity.description, 170); // Width: 170mm
            doc.text(splitText, 20, yPos);
            
            // Update y position based on number of lines
            yPos += splitText.length * 5 + 10;
          } else {
            yPos += 10;
          }
          
          // Add a separator line between activities (except last one)
          if (j < day.activities.length - 1) {
            doc.setDrawColor(229, 231, 235); // border-gray-200
            doc.setLineWidth(0.2);
            doc.line(20, yPos - 5, 190, yPos - 5);
          }
          
          // Check if we need a new page
          if (yPos > 270) {
            addPageWithHeader(`Day ${day.day} Schedule (continued)`);
            yPos = 40;
          }
        }
      }
      
      // Tips page
      addPageWithHeader("Travel Tips & Instructions");
      
      // Column 1 tips (left side)
      let yPos = 40;
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text("Before You Go", 20, yPos);
      yPos += 10;
      
      const beforeTips = [
        "Check weather forecasts daily",
        "Download offline maps of each area",
        "Keep digital and physical copies of your itinerary",
        "Have emergency contacts saved on your phone",
        "Pack appropriate clothing for your activities"
      ];
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      beforeTips.forEach((tip, index) => {
        doc.text(`${index + 1}. ${tip}`, 20, yPos);
        yPos += 7;
      });
      
      // Column 2 tips (right side)
      yPos = 40;
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text("During Your Trip", 110, yPos);
      yPos += 10;
      
      const duringTips = [
        "Arrive 30 minutes early for scheduled activities",
        "Always carry water and stay hydrated",
        "Be respectful of local customs and traditions",
        "Take regular breaks to avoid exhaustion",
        "Try local cuisine for an authentic experience"
      ];
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      duringTips.forEach((tip, index) => {
        doc.text(`${index + 1}. ${tip}`, 110, yPos);
        yPos += 7;
      });
      
      // Disclaimer at the bottom
      yPos = 260;
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175); // text-gray-400
      const disclaimer = "This itinerary was generated by the Navi Mumbai Travel Planner app. Plan details may change due to weather conditions, availability, or other factors.";
      const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
      doc.text(splitDisclaimer, 20, yPos);

      // Save the PDF
      doc.save(`navi-mumbai-itinerary-${details.days}-days.pdf`);
      return true;
    } catch (error) {
      console.error('Error creating PDF:', error);
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
