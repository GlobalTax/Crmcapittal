import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransaccionActivity {
  id: string;
  transaccion_id: string;
  activity_type: 'created' | 'updated' | 'stage_changed' | 'note_added' | 'task_created' | 'task_completed' | 'document_uploaded' | 'contact_interaction';
  title: string;
  description?: string;
  activity_data: Record<string, any>;
  created_at: string;
  created_by?: string;
}

export const useTransaccionActivities = (transaccionId: string) => {
  const [activities, setActivities] = useState<TransaccionActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!transaccionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Since we don't have a specific transaccion_activities table, 
      // we'll create mock activities based on transaction updates
      // In a real implementation, you would create a proper activities table
      const mockActivities: TransaccionActivity[] = [
        {
          id: '1',
          transaccion_id: transaccionId,
          activity_type: 'created',
          title: 'Transacción creada',
          description: 'Se creó la transacción en el sistema',
          activity_data: {},
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setActivities(mockActivities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las actividades';
      setError(errorMessage);
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (
    activityType: TransaccionActivity['activity_type'],
    title: string,
    description?: string,
    activityData: Record<string, any> = {}
  ) => {
    try {
      // In a real implementation, this would save to a transaccion_activities table
      const newActivity: TransaccionActivity = {
        id: Date.now().toString(),
        transaccion_id: transaccionId,
        activity_type: activityType,
        title,
        description,
        activity_data: activityData,
        created_at: new Date().toISOString()
      };

      setActivities(prev => [newActivity, ...prev]);
      
      toast({
        title: "Actividad registrada",
        description: title,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar la actividad';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error adding activity:', err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [transaccionId]);

  return {
    activities,
    loading,
    error,
    addActivity,
    refetch: fetchActivities
  };
};