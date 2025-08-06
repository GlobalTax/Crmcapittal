import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/Lead';
import { toast } from 'sonner';

interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  assignedLeadsCount: number;
}

export const useLeadAssignments = () => {
  const queryClient = useQueryClient();
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch all workers (users who can be assigned leads)
  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_users_with_roles');
      
      if (error) throw error;

      // Get assigned leads count for each worker
      const workersWithCount = await Promise.all(
        data.map(async (worker) => {
          const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to_id', worker.user_id)
            .neq('status', 'DISQUALIFIED');

          return {
            id: worker.user_id,
            first_name: worker.first_name || '',
            last_name: worker.last_name || '',
            email: worker.email || '',
            assignedLeadsCount: count || 0,
          };
        })
      );

      return workersWithCount;
    },
  });

  // Fetch unassigned leads
  const { data: unassignedLeads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['unassigned-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .is('assigned_to_id', null)
        .neq('status', 'DISQUALIFIED')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  // Assign leads to a specific worker
  const assignLeadsMutation = useMutation({
    mutationFn: async ({ leadIds, workerId }: { leadIds: string[]; workerId: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ 
          assigned_to_id: workerId,
          status: 'CONTACTED' // Automatically mark as contacted when assigned
        })
        .in('id', leadIds);

      if (error) throw error;

      return { leadIds, workerId };
    },
    onSuccess: ({ leadIds, workerId }) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['workload-metrics'] });

      const workerName = workers.find(w => w.id === workerId);
      toast.success(
        `${leadIds.length} leads asignados a ${workerName?.first_name} ${workerName?.last_name}`
      );
    },
    onError: (error) => {
      console.error('Error assigning leads:', error);
      toast.error('Error al asignar leads');
    },
  });

  // Auto-assign leads based on workload balancing
  const autoAssignMutation = useMutation({
    mutationFn: async (leadIds: string[]) => {
      // Simple round-robin assignment based on current workload
      const sortedWorkers = [...workers].sort((a, b) => 
        a.assignedLeadsCount - b.assignedLeadsCount
      );

      const assignments = leadIds.map((leadId, index) => ({
        leadId,
        workerId: sortedWorkers[index % sortedWorkers.length].id,
      }));

      // Batch update all leads
      for (const assignment of assignments) {
        const { error } = await supabase
          .from('leads')
          .update({ 
            assigned_to_id: assignment.workerId,
            status: 'CONTACTED'
          })
          .eq('id', assignment.leadId);

        if (error) throw error;
      }

      return assignments;
    },
    onSuccess: (assignments) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['workload-metrics'] });

      toast.success(`${assignments.length} leads asignados automáticamente`);
    },
    onError: (error) => {
      console.error('Error auto-assigning leads:', error);
      toast.error('Error en la asignación automática');
    },
  });

  // Redistribute workload
  const redistributeMutation = useMutation({
    mutationFn: async () => {
      // Get all assigned leads
      const { data: assignedLeads, error: fetchError } = await supabase
        .from('leads')
        .select('id, assigned_to_id')
        .not('assigned_to_id', 'is', null)
        .neq('status', 'DISQUALIFIED');

      if (fetchError) throw fetchError;

      // Calculate ideal distribution
      const totalLeads = assignedLeads.length;
      const totalWorkers = workers.length;
      const leadsPerWorker = Math.floor(totalLeads / totalWorkers);
      const extraLeads = totalLeads % totalWorkers;

      // Redistribute
      const shuffledLeads = [...assignedLeads].sort(() => Math.random() - 0.5);
      let leadIndex = 0;

      for (let workerIndex = 0; workerIndex < workers.length; workerIndex++) {
        const worker = workers[workerIndex];
        const shouldGetExtra = workerIndex < extraLeads;
        const targetCount = leadsPerWorker + (shouldGetExtra ? 1 : 0);

        const leadsToAssign = shuffledLeads.slice(leadIndex, leadIndex + targetCount);
        leadIndex += targetCount;

        for (const lead of leadsToAssign) {
          const { error } = await supabase
            .from('leads')
            .update({ assigned_to_id: worker.id })
            .eq('id', lead.id);

          if (error) throw error;
        }
      }

      return { redistributed: totalLeads };
    },
    onSuccess: ({ redistributed }) => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['workload-metrics'] });

      toast.success(`${redistributed} leads redistribuidos equitativamente`);
    },
    onError: (error) => {
      console.error('Error redistributing leads:', error);
      toast.error('Error al redistribuir la carga');
    },
  });

  const assignLeads = async (leadIds: string[], workerId: string) => {
    setIsAssigning(true);
    try {
      await assignLeadsMutation.mutateAsync({ leadIds, workerId });
    } finally {
      setIsAssigning(false);
    }
  };

  const autoAssignLeads = async (leadIds?: string[]) => {
    setIsAssigning(true);
    try {
      const idsToAssign = leadIds || unassignedLeads.map(lead => lead.id);
      await autoAssignMutation.mutateAsync(idsToAssign);
    } finally {
      setIsAssigning(false);
    }
  };

  const redistributeWorkload = async () => {
    setIsAssigning(true);
    try {
      await redistributeMutation.mutateAsync();
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    workers,
    unassignedLeads,
    isLoading: workersLoading || leadsLoading,
    isAssigning: isAssigning || assignLeadsMutation.isPending || autoAssignMutation.isPending || redistributeMutation.isPending,
    assignLeads,
    autoAssignLeads,
    redistributeWorkload,
  };
};