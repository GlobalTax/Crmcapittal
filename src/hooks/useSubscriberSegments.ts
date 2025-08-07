import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriberSegment {
  id: string;
  name: string;
  description?: string;
  segment_type: 'manual' | 'auto' | 'behavioral';
  conditions: any;
  subscriber_count: number;
  last_calculated_at?: string;
  is_dynamic: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSegmentData {
  name: string;
  description?: string;
  segment_type: 'manual' | 'auto' | 'behavioral';
  conditions: any;
  is_dynamic?: boolean;
}

export function useSubscriberSegments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch segments
  const {
    data: segments,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscriber-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriber_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SubscriberSegment[];
    }
  });

  // Create segment
  const createSegment = useMutation({
    mutationFn: async (segmentData: CreateSegmentData) => {
      const { data, error } = await supabase
        .from('subscriber_segments')
        .insert([{
          ...segmentData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-segments'] });
      toast({
        title: "Segmento creado",
        description: "El segmento se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating segment:', error);
      toast({
        title: "Error",
        description: "Error al crear el segmento.",
        variant: "destructive",
      });
    }
  });

  // Update segment
  const updateSegment = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<SubscriberSegment> & { id: string }) => {
      const { data, error } = await supabase
        .from('subscriber_segments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-segments'] });
      toast({
        title: "Segmento actualizado",
        description: "El segmento se ha actualizado exitosamente.",
      });
    }
  });

  // Delete segment
  const deleteSegment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscriber_segments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-segments'] });
      toast({
        title: "Segmento eliminado",
        description: "El segmento se ha eliminado exitosamente.",
      });
    }
  });

  // Calculate segment (trigger automation)
  const calculateSegment = useMutation({
    mutationFn: async (segmentId: string) => {
      const { data, error } = await supabase.functions.invoke('rod-automation', {
        body: {
          type: 'segment_calculation',
          config: { segment_id: segmentId }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-segments'] });
      toast({
        title: "Segmento calculado",
        description: "El segmento se ha recalculado exitosamente.",
      });
    }
  });

  // Get segment members
  const getSegmentMembers = async (segmentId: string) => {
    const { data, error } = await supabase
      .from('subscriber_segment_members')
      .select(`
        *,
        subscribers:subscriber_id (
          id,
          email,
          segment,
          engagement_level,
          behavior_score
        )
      `)
      .eq('segment_id', segmentId);

    if (error) throw error;
    return data;
  };

  // Add subscriber to segment
  const addToSegment = useMutation({
    mutationFn: async ({ segmentId, subscriberIds }: { segmentId: string; subscriberIds: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const memberships = subscriberIds.map(subscriberId => ({
        subscriber_id: subscriberId,
        segment_id: segmentId,
        added_by: user?.id
      }));

      const { error } = await supabase
        .from('subscriber_segment_members')
        .insert(memberships);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-segments'] });
      toast({
        title: "Suscriptores añadidos",
        description: "Los suscriptores se han añadido al segmento.",
      });
    }
  });

  // Remove subscriber from segment
  const removeFromSegment = useMutation({
    mutationFn: async ({ segmentId, subscriberIds }: { segmentId: string; subscriberIds: string[] }) => {
      const { error } = await supabase
        .from('subscriber_segment_members')
        .delete()
        .eq('segment_id', segmentId)
        .in('subscriber_id', subscriberIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-segments'] });
      toast({
        title: "Suscriptores removidos",
        description: "Los suscriptores se han removido del segmento.",
      });
    }
  });

  return {
    segments,
    isLoading,
    error,
    refetch,
    createSegment: createSegment.mutateAsync,
    updateSegment: updateSegment.mutateAsync,
    deleteSegment: deleteSegment.mutateAsync,
    calculateSegment: calculateSegment.mutateAsync,
    getSegmentMembers,
    addToSegment: addToSegment.mutateAsync,
    removeFromSegment: removeFromSegment.mutateAsync,
    isCreating: createSegment.isPending,
    isUpdating: updateSegment.isPending,
    isDeleting: deleteSegment.isPending,
    isCalculating: calculateSegment.isPending
  };
}