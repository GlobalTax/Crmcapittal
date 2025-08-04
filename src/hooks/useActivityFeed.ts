import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  created_at: string;
  user_id?: string;
}

export const useActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Get activities from contact_activities table
        const { data: contactActivities, error: contactError } = await supabase
          .from('contact_activities')
          .select('id, activity_type, title, description, created_at')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (contactError) {
          console.error('Error fetching contact activities:', contactError);
        }

        // Transform contact activities
        const transformedContactActivities: ActivityItem[] = (contactActivities || []).map(activity => ({
          id: activity.id,
          type: activity.activity_type,
          title: activity.title,
          description: activity.description,
          created_at: activity.created_at,
          user_id: user.id
        }));

        // Add some mock activities for demonstration
        const mockActivities: ActivityItem[] = [
          {
            id: 'mock-1',
            type: 'task_completed',
            title: 'Tarea completada: Llamar a Juan Pérez',
            description: 'Llamada realizada con éxito',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            user_id: user.id
          },
          {
            id: 'mock-2',
            type: 'lead_converted',
            title: 'Lead convertido: María García',
            description: 'El lead ha sido convertido a oportunidad',
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            user_id: user.id
          },
          {
            id: 'mock-3',
            type: 'deal_created',
            title: 'Nuevo negocio: Consultoria ABC',
            description: 'Propuesta de consultoría valorada en €25,000',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            user_id: user.id
          },
          {
            id: 'mock-4',
            type: 'email_sent',
            title: 'Email enviado a cliente XYZ',
            description: 'Seguimiento de propuesta comercial',
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
            user_id: user.id
          }
        ];

        // Combine real and mock activities
        const allActivities = [...transformedContactActivities, ...mockActivities]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 20);

        setActivities(allActivities);
      } catch (err) {
        console.error('Error fetching activity feed:', err);
        setError(err instanceof Error ? err.message : 'Error fetching activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Refresh every 5 minutes
    const interval = setInterval(fetchActivities, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return { activities, loading, error };
};