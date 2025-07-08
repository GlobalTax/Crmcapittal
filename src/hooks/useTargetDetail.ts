import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MandateTargetActivity,
  MandateTargetEnrichment, 
  MandateTargetFollowup,
  CreateTargetActivityData,
  CreateTargetFollowupData 
} from '@/types/BuyingMandate';

export const useTargetDetail = (targetId: string) => {
  const [activities, setActivities] = useState<MandateTargetActivity[]>([]);
  const [enrichments, setEnrichments] = useState<MandateTargetEnrichment[]>([]);
  const [followups, setFollowups] = useState<MandateTargetFollowup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!targetId) return;
    
    try {
      const { data, error } = await supabase
        .from('mandate_target_activities')
        .select('*')
        .eq('target_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities((data || []) as MandateTargetActivity[]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [targetId]);

  // Fetch enrichments
  const fetchEnrichments = useCallback(async () => {
    if (!targetId) return;
    
    try {
      const { data, error } = await supabase
        .from('mandate_target_enrichments')
        .select('*')
        .eq('target_id', targetId)
        .order('enriched_at', { ascending: false });

      if (error) throw error;
      setEnrichments((data || []) as MandateTargetEnrichment[]);
    } catch (error) {
      console.error('Error fetching enrichments:', error);
    }
  }, [targetId]);

  // Fetch followups
  const fetchFollowups = useCallback(async () => {
    if (!targetId) return;
    
    try {
      const { data, error } = await supabase
        .from('mandate_target_followups')
        .select('*')
        .eq('target_id', targetId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setFollowups((data || []) as MandateTargetFollowup[]);
    } catch (error) {
      console.error('Error fetching followups:', error);
    }
  }, [targetId]);

  // Add activity
  const addActivity = async (activityData: CreateTargetActivityData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('mandate_target_activities')
        .insert({
          ...activityData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Actividad registrada correctamente',
      });

      await fetchActivities();
      return data;
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar la actividad',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Add followup
  const addFollowup = async (followupData: CreateTargetFollowupData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('mandate_target_followups')
        .insert({
          ...followupData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Recordatorio programado correctamente',
      });

      await fetchFollowups();
      return data;
    } catch (error) {
      console.error('Error adding followup:', error);
      toast({
        title: 'Error',
        description: 'No se pudo programar el recordatorio',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Complete followup
  const completeFollowup = async (followupId: string) => {
    try {
      const { error } = await supabase
        .from('mandate_target_followups')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', followupId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Recordatorio completado',
      });

      await fetchFollowups();
    } catch (error) {
      console.error('Error completing followup:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar el recordatorio',
        variant: 'destructive',
      });
    }
  };

  // Enrich target with eInforma
  const enrichWithEInforma = async (nif: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('company-lookup-einforma', {
        body: { nif }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        // Save enrichment data
        const enrichmentData = {
          target_id: targetId,
          enrichment_data: data.data,
          source: 'einforma',
          confidence_score: data.confidence_score || 0.95,
        };

        const { error: saveError } = await supabase
          .from('mandate_target_enrichments')
          .insert(enrichmentData);

        if (saveError) throw saveError;

        // Add activity for enrichment
        await addActivity({
          target_id: targetId,
          activity_type: 'einforma_enrichment',
          title: 'Datos enriquecidos con eInforma',
          description: `Se obtuvieron datos actualizados de ${data.data.name}`,
          activity_data: {
            source: 'einforma',
            company_name: data.data.name,
            nif: nif,
          }
        });

        await fetchEnrichments();
        
        toast({
          title: 'Éxito',
          description: 'Datos de eInforma actualizados correctamente',
        });

        return data.data;
      } else {
        toast({
          title: 'Información',
          description: 'No se encontraron datos adicionales en eInforma',
        });
      }
    } catch (error) {
      console.error('Error enriching with eInforma:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron obtener los datos de eInforma',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate NDA
  const generateNDA = async (targetName: string, contactName: string) => {
    try {
      // Add activity for NDA generation
      await addActivity({
        target_id: targetId,
        activity_type: 'nda_generated',
        title: 'NDA generado',
        description: `Se generó un Acuerdo de Confidencialidad para ${targetName}`,
        activity_data: {
          target_name: targetName,
          contact_name: contactName,
          generated_at: new Date().toISOString(),
        }
      });

      toast({
        title: 'Éxito',
        description: 'NDA generado correctamente',
      });
    } catch (error) {
      console.error('Error generating NDA:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el NDA',
        variant: 'destructive',
      });
    }
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!targetId) return;
    
    setIsLoading(true);
    try {
      await Promise.all([
        fetchActivities(),
        fetchEnrichments(),
        fetchFollowups(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, fetchActivities, fetchEnrichments, fetchFollowups]);

  return {
    activities,
    enrichments,
    followups,
    isLoading,
    fetchAllData,
    addActivity,
    addFollowup,
    completeFollowup,
    enrichWithEInforma,
    generateNDA,
  };
};