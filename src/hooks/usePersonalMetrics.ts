import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalTasks } from './usePersonalTasks';
import { useLeads } from './useLeads';
import { useNegocios } from './useNegocios';
import { useTimeEntries } from './useTimeEntries';

export const usePersonalMetrics = () => {
  const { user } = useAuth();
  const { tasks, getTodayTasks, getCompletedTasks } = usePersonalTasks();
  const { leads } = useLeads({ owner_id: user?.id });
  const { negocios } = useNegocios();
  const { timeEntries } = useTimeEntries();

  const metrics = useMemo(() => {
    const todayTasks = getTodayTasks();
    const completedTasks = getCompletedTasks();
    
    // Tasks metrics with progress
    const tasksToday = {
      total: todayTasks.length,
      completed: completedTasks.filter(task => {
        const today = new Date();
        const taskDate = new Date(task.updated_at);
        return taskDate.toDateString() === today.toDateString();
      }).length
    };

    // Active leads (created in last 30 days)
    const activeLeads = leads.filter(lead => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(lead.created_at) >= thirtyDaysAgo;
    });

    // Revenue pipeline from active negocios
    const activeNegocios = negocios.filter(negocio => negocio.is_active);
    const revenuePipeline = activeNegocios.reduce((total, negocio) => {
      return total + (negocio.valor_negocio || 0);
    }, 0);

    // Today's productive time
    const today = new Date();
    const todayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate.toDateString() === today.toDateString() && entry.end_time;
    });
    
    const productiveTime = todayEntries.reduce((total, entry) => {
      return total + (entry.duration_minutes || 0);
    }, 0);

    return {
      tasksToday,
      activeLeads: activeLeads.length,
      revenuePipeline,
      productiveTime: Math.round(productiveTime / 60 * 10) / 10 // Convert to hours with 1 decimal
    };
  }, [tasks, leads, negocios, timeEntries, getTodayTasks, getCompletedTasks]);

  return metrics;
};