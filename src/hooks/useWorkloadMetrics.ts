import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WorkerMetrics {
  conversionRate: number;
  averageResponseTime: number;
  completedLeads: number;
  totalLeads: number;
  workloadScore: number; // 0-100
}

interface WorkloadMetrics {
  workerMetrics: Record<string, WorkerMetrics>;
  averageConversionRate: number;
  averageWorkload: number;
  totalLeads: number;
  totalWorkers: number;
}

export const useWorkloadMetrics = () => {
  const { data: workloadMetrics, isLoading, error } = useQuery({
    queryKey: ['workload-metrics'],
    queryFn: async (): Promise<WorkloadMetrics> => {
      // Get all workers
      const { data: workers, error: workersError } = await supabase.rpc('get_users_with_roles');
      if (workersError) throw workersError;

      const workerMetrics: Record<string, WorkerMetrics> = {};
      let totalConversionRate = 0;
      let totalWorkload = 0;
      let totalLeads = 0;
      let validWorkers = 0;

      for (const worker of workers) {
        const workerId = worker.user_id;

        // Get assigned leads for this worker
        const { data: assignedLeads, error: leadsError } = await supabase
          .from('leads')
          .select('id, status, created_at, last_contacted')
          .eq('assigned_to_id', workerId);

        if (leadsError) continue;

        const totalWorkerLeads = assignedLeads.length;
        const completedLeads = assignedLeads.filter(lead => 
          lead.status === 'QUALIFIED'
        ).length;

        // Calculate conversion rate
        const conversionRate = totalWorkerLeads > 0 ? completedLeads / totalWorkerLeads : 0;

        // Calculate average response time (simplified)
        const avgResponseTime = assignedLeads.reduce((acc, lead) => {
          if (lead.last_contacted && lead.created_at) {
            const responseTime = 
              (new Date(lead.last_contacted).getTime() - new Date(lead.created_at).getTime()) / 
              (1000 * 60 * 60); // hours
            return acc + responseTime;
          }
          return acc + 24; // Default 24h if no contact made
        }, 0) / Math.max(totalWorkerLeads, 1);

        // Calculate workload score (based on lead count and conversion rate)
        const maxLeadsThreshold = 30; // Configurable threshold
        const workloadScore = Math.min(100, (totalWorkerLeads / maxLeadsThreshold) * 100);

        workerMetrics[workerId] = {
          conversionRate,
          averageResponseTime: Math.round(avgResponseTime),
          completedLeads,
          totalLeads: totalWorkerLeads,
          workloadScore: Math.round(workloadScore),
        };

        totalConversionRate += conversionRate;
        totalWorkload += totalWorkerLeads;
        totalLeads += totalWorkerLeads;
        validWorkers++;
      }

      return {
        workerMetrics,
        averageConversionRate: validWorkers > 0 ? totalConversionRate / validWorkers : 0,
        averageWorkload: validWorkers > 0 ? totalWorkload / validWorkers : 0,
        totalLeads,
        totalWorkers: validWorkers,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    workloadMetrics,
    isLoading,
    error,
  };
};