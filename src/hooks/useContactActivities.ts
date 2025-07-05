import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContactActivity {
  id: string;
  contact_id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_data?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface ActivityStats {
  total: number;
  this_week: number;
  this_month: number;
  by_type: Record<string, number>;
}

export function useContactActivities(contactId?: string) {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    this_week: 0,
    this_month: 0,
    by_type: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadActivities = async (contactId: string) => {
    if (!contactId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedActivities = (data || []).map(activity => ({
        ...activity,
        activity_data: typeof activity.activity_data === 'object' ? activity.activity_data as Record<string, any> : {}
      }));

      setActivities(transformedActivities);
      calculateStats(transformedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (activities: ContactActivity[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: ActivityStats = {
      total: activities.length,
      this_week: 0,
      this_month: 0,
      by_type: {}
    };

    activities.forEach(activity => {
      const activityDate = new Date(activity.created_at);
      
      // Count weekly activities
      if (activityDate >= oneWeekAgo) {
        stats.this_week++;
      }
      
      // Count monthly activities
      if (activityDate >= oneMonthAgo) {
        stats.this_month++;
      }
      
      // Count by type
      stats.by_type[activity.activity_type] = (stats.by_type[activity.activity_type] || 0) + 1;
    });

    setStats(stats);
  };

  const addActivity = async (contactId: string, activityData: {
    activity_type: string;
    title: string;
    description?: string;
    activity_data?: Record<string, any>;
  }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('contact_activities')
        .insert({
          contact_id: contactId,
          ...activityData,
          created_by: user.user.id
        });

      if (error) throw error;
      
      // Reload activities after adding
      await loadActivities(contactId);
      toast.success('Actividad añadida correctamente');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Error al añadir la actividad');
      throw error;
    }
  };

  const getRecentActivities = (limit: number = 5) => {
    return activities.slice(0, limit);
  };

  const getActivitiesByType = (activityType: string) => {
    return activities.filter(activity => activity.activity_type === activityType);
  };

  // Load activities when contactId changes
  useEffect(() => {
    if (contactId) {
      loadActivities(contactId);
    }
  }, [contactId]);

  return {
    activities,
    stats,
    isLoading,
    loadActivities,
    addActivity,
    getRecentActivities,
    getActivitiesByType,
    refreshActivities: () => contactId && loadActivities(contactId)
  };
}