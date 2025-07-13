import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadAnalytics {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageScore: number;
  averageEngagement: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  scoreDistribution: { range: string; count: number }[];
  recentTrends: {
    period: string;
    newLeads: number;
    qualified: number;
    converted: number;
  }[];
}

export interface LeadSegment {
  id: string;
  name: string;
  description?: string | null;
  criteria: any;
  color: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  leadCount?: number;
}

export const useLeadAnalytics = () => {
  return useQuery({
    queryKey: ['lead-analytics'],
    queryFn: async (): Promise<LeadAnalytics> => {
      // Get basic lead stats
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, status, source, created_at');

      if (leadsError) throw leadsError;

      const totalLeads = leads?.length || 0;
      const qualifiedLeads = leads?.filter(l => l.status === 'QUALIFIED').length || 0;
      const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
      // Get lead scores from lead_nurturing table
      const { data: nurturingScores } = await supabase
        .from('lead_nurturing')
        .select('lead_score');
      
      const averageScore = nurturingScores?.reduce((acc, n) => acc + (n.lead_score || 0), 0) / (nurturingScores?.length || 1) || 0;

      // Get engagement scores
      const { data: nurturingData } = await supabase
        .from('lead_nurturing')
        .select('engagement_score');

      const averageEngagement = nurturingData?.reduce((acc, n) => acc + (n.engagement_score || 0), 0) / (nurturingData?.length || 1) || 0;

      // Group by source
      const leadsBySource = leads?.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Group by status
      const leadsByStatus = leads?.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Score distribution using nurturing data
      const scoreDistribution = [
        { range: '0-20', count: nurturingScores?.filter(l => (l.lead_score || 0) <= 20).length || 0 },
        { range: '21-40', count: nurturingScores?.filter(l => (l.lead_score || 0) > 20 && (l.lead_score || 0) <= 40).length || 0 },
        { range: '41-60', count: nurturingScores?.filter(l => (l.lead_score || 0) > 40 && (l.lead_score || 0) <= 60).length || 0 },
        { range: '61-80', count: nurturingScores?.filter(l => (l.lead_score || 0) > 60 && (l.lead_score || 0) <= 80).length || 0 },
        { range: '81+', count: nurturingScores?.filter(l => (l.lead_score || 0) > 80).length || 0 },
      ];

      // Recent trends (last 7 days)
      const recentTrends = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayLeads = leads?.filter(l => l.created_at?.startsWith(dateStr)) || [];
        
        return {
          period: dateStr,
          newLeads: dayLeads.length,
          qualified: dayLeads.filter(l => l.status === 'QUALIFIED').length,
          converted: dayLeads.filter(l => l.status === 'QUALIFIED').length, // Using QUALIFIED as proxy for converted
        };
      }).reverse();

      return {
        totalLeads,
        qualifiedLeads,
        conversionRate,
        averageScore,
        averageEngagement,
        leadsBySource,
        leadsByStatus,
        scoreDistribution,
        recentTrends,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useLeadSegments = () => {
  return useQuery({
    queryKey: ['lead-segments'],
    queryFn: async (): Promise<LeadSegment[]> => {
      const { data, error } = await supabase
        .from('lead_segments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Get lead count for each segment
      const segmentsWithCount = await Promise.all(
        (data || []).map(async (segment) => {
          const { count } = await supabase
            .from('lead_segment_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('segment_id', segment.id);

          return { ...segment, leadCount: count || 0 };
        })
      );

      return segmentsWithCount;
    },
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (segment: Omit<LeadSegment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('lead_segments')
        .insert([segment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-segments'] });
      toast.success('Segmento creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating segment:', error);
      toast.error('Error al crear el segmento');
    },
  });
};

export const useBulkLeadActions = () => {
  const queryClient = useQueryClient();

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ leadIds, status }: { leadIds: string[]; status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED' }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', leadIds);

      if (error) throw error;
    },
    onSuccess: (_, { leadIds }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`${leadIds.length} leads actualizados exitosamente`);
    },
    onError: (error) => {
      console.error('Error updating leads:', error);
      toast.error('Error al actualizar los leads');
    },
  });

  const bulkAssign = useMutation({
    mutationFn: async ({ leadIds, userId }: { leadIds: string[]; userId: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ assigned_to_id: userId, updated_at: new Date().toISOString() })
        .in('id', leadIds);

      if (error) throw error;
    },
    onSuccess: (_, { leadIds }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(`${leadIds.length} leads asignados exitosamente`);
    },
    onError: (error) => {
      console.error('Error assigning leads:', error);
      toast.error('Error al asignar los leads');
    },
  });

  const bulkAddToSegment = useMutation({
    mutationFn: async ({ leadIds, segmentId }: { leadIds: string[]; segmentId: string }) => {
      const assignments = leadIds.map(leadId => ({
        lead_id: leadId,
        segment_id: segmentId,
      }));

      const { error } = await supabase
        .from('lead_segment_assignments')
        .upsert(assignments);

      if (error) throw error;
    },
    onSuccess: (_, { leadIds }) => {
      queryClient.invalidateQueries({ queryKey: ['lead-segments'] });
      toast.success(`${leadIds.length} leads añadidos al segmento`);
    },
    onError: (error) => {
      console.error('Error adding leads to segment:', error);
      toast.error('Error al añadir leads al segmento');
    },
  });

  return {
    bulkUpdateStatus: bulkUpdateStatus.mutate,
    bulkAssign: bulkAssign.mutate,
    bulkAddToSegment: bulkAddToSegment.mutate,
    isLoading: bulkUpdateStatus.isPending || bulkAssign.isPending || bulkAddToSegment.isPending,
  };
};