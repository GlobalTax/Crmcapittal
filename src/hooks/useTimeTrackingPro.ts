import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ActivityCategory, 
  EnhancedTimeEntry, 
  ProductivitySettings,
  ActivitySuggestion,
  TimeTrackingAnalytics,
  CreateTimeEntryProData,
  SmartTimerSuggestion,
  TimerContext,
  ProjectRate,
  TeamTimeData,
  TimeTrackingFilter,
  ProductivityMetrics
} from '@/types/TimeTrackingPro';
import { useAuth } from '@/contexts/AuthContext';

export const useActivityCategories = () => {
  return useQuery({
    queryKey: ['activity-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as ActivityCategory[];
    }
  });
};

export const useProductivitySettings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['productivity-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('productivity_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ProductivitySettings | null;
    },
    enabled: !!user?.id
  });
};

export const useEnhancedTimeEntries = (filter?: TimeTrackingFilter) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['enhanced-time-entries', user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          category:activity_categories(*),
          project_rate:project_rates(*),
          planned_task:planned_tasks(title),
          lead:leads(id, name, company_name),
          mandate:buying_mandates(id, mandate_name, client_name),
          contact:contacts(id, name)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      // Aplicar filtros
      if (filter?.date_from) {
        query = query.gte('start_time', filter.date_from);
      }
      if (filter?.date_to) {
        query = query.lte('start_time', filter.date_to);
      }
      if (filter?.category_ids?.length) {
        query = query.in('category_id', filter.category_ids);
      }
      if (filter?.is_billable !== undefined) {
        query = query.eq('is_billable', filter.is_billable);
      }
      if (filter?.billing_status?.length) {
        query = query.in('billing_status', filter.billing_status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as EnhancedTimeEntry[];
    },
    enabled: !!user?.id
  });
};

export const useSmartTimer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [context, setContext] = useState<TimerContext>({});
  const [suggestions, setSuggestions] = useState<SmartTimerSuggestion[]>([]);

  // Obtener sugerencias activas
  const { data: activeSuggestions } = useQuery({
    queryKey: ['activity-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('activity_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('suggested_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as ActivitySuggestion[];
    },
    enabled: !!user?.id
  });

  // Mutation para crear entrada de tiempo mejorada
  const createTimeEntryMutation = useMutation({
    mutationFn: async (data: CreateTimeEntryProData) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data: result, error } = await supabase
        .from('time_entries')
        .insert({
          ...data,
          user_id: user.id
        })
        .select(`
          *,
          category:activity_categories(*),
          project_rate:project_rates(*)
        `)
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-tracking-analytics'] });
      toast.success('Tiempo registrado correctamente');
    },
    onError: (error) => {
      console.error('Error al crear entrada de tiempo:', error);
      toast.error('Error al registrar tiempo');
    }
  });

  // Función para generar sugerencias inteligentes
  const generateSmartSuggestions = async (): Promise<SmartTimerSuggestion[]> => {
    const suggestions: SmartTimerSuggestion[] = [];

    // Sugerencia de continuar trabajo anterior
    const { data: lastEntry } = await supabase
      .from('time_entries')
      .select('*, category:activity_categories(*)')
      .eq('user_id', user?.id)
      .order('end_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastEntry && lastEntry.end_time) {
      const timeSinceLastEntry = Date.now() - new Date(lastEntry.end_time).getTime();
      if (timeSinceLastEntry < 4 * 60 * 60 * 1000) { // 4 horas
        suggestions.push({
          type: 'continue_work',
          title: 'Continuar trabajo anterior',
          message: `¿Continuar con "${lastEntry.description || lastEntry.category?.name}"?`,
          action: 'continue',
          data: lastEntry,
          confidence: 0.8
        });
      }
    }

    // Verificar si necesita descanso
    const { data: todayEntries } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user?.id)
      .gte('start_time', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
      .order('start_time');

    if (todayEntries && todayEntries.length > 0) {
      const totalMinutesToday = todayEntries.reduce((acc, entry) => 
        acc + (entry.duration_minutes || 0), 0);
      
      const lastBreak = todayEntries
        .filter(entry => entry.break_type)
        .pop();

      if (totalMinutesToday > 90 && (!lastBreak || 
          Date.now() - new Date(lastBreak.end_time || lastBreak.start_time).getTime() > 90 * 60 * 1000)) {
        suggestions.push({
          type: 'break_reminder',
          title: 'Hora de un descanso',
          message: 'Has trabajado 90+ minutos. Un descanso mejorará tu productividad.',
          action: 'take_break',
          confidence: 0.9
        });
      }
    }

    return suggestions;
  };

  // Hook para analytics de productividad
  const useProductivityAnalytics = (userId: string, period: { start: string; end: string }) => {
    return useQuery({
      queryKey: ['productivity-analytics', userId, period],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('time_tracking_analytics')
          .select('*')
          .eq('user_id', userId)
          .gte('date', period.start)
          .lte('date', period.end)
          .order('date');

        if (error) throw error;
        
        // Calcular métricas agregadas
        const analytics = data as TimeTrackingAnalytics[];
        const totalDays = analytics.length;
        
        if (totalDays === 0) {
          return {
            total_hours: 0,
            billable_hours: 0,
            revenue_generated: 0,
            average_focus_score: 0,
            average_efficiency_score: 0,
            productivity_trend: 0,
            daily_breakdown: []
          };
        }

        const totalMinutes = analytics.reduce((acc, day) => acc + day.total_minutes, 0);
        const billableMinutes = analytics.reduce((acc, day) => acc + day.billable_minutes, 0);
        const totalRevenue = analytics.reduce((acc, day) => acc + day.revenue_generated, 0);
        const avgFocusScore = analytics.reduce((acc, day) => acc + day.focus_score, 0) / totalDays;
        const avgEfficiencyScore = analytics.reduce((acc, day) => acc + day.efficiency_score, 0) / totalDays;

        return {
          total_hours: Math.round(totalMinutes / 60 * 100) / 100,
          billable_hours: Math.round(billableMinutes / 60 * 100) / 100,
          revenue_generated: totalRevenue,
          average_focus_score: Math.round(avgFocusScore * 100) / 100,
          average_efficiency_score: Math.round(avgEfficiencyScore * 100) / 100,
          productivity_trend: totalDays > 1 ? 
            ((analytics[analytics.length - 1].efficiency_score - analytics[0].efficiency_score) / analytics[0].efficiency_score) * 100 : 0,
          daily_breakdown: analytics
        };
      },
      enabled: !!userId
    });
  };

  return {
    context,
    setContext,
    suggestions,
    activeSuggestions,
    createTimeEntry: createTimeEntryMutation.mutate,
    isCreating: createTimeEntryMutation.isPending,
    generateSmartSuggestions,
    useProductivityAnalytics
  };
};

export const useProjectRates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rates, isLoading } = useQuery({
    queryKey: ['project-rates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('project_rates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProjectRate[];
    },
    enabled: !!user?.id
  });

  const createRateMutation = useMutation({
    mutationFn: async (rateData: Omit<ProjectRate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('project_rates')
        .insert({
          ...rateData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-rates'] });
      toast.success('Tarifa creada correctamente');
    }
  });

  return {
    rates,
    isLoading,
    createRate: createRateMutation.mutate,
    isCreating: createRateMutation.isPending
  };
};

export const useTeamTimeTracking = () => {
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team-time-tracking'],
    queryFn: async () => {
      // Obtener usuarios del equipo con su tiempo activo
        const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          first_name,
          last_name
        `);

      if (usersError) throw usersError;

      const teamData: TeamTimeData[] = [];

      for (const user of users) {
        // Obtener timer activo
        const { data: activeTimer } = await supabase
          .from('time_entries')
          .select(`
            *,
            category:activity_categories(*),
            lead:leads(name, company_name),
            mandate:buying_mandates(mandate_name, client_name)
          `)
          .eq('user_id', user.id)
          .is('end_time', null)
          .maybeSingle();

        // Obtener horas del día
        const today = new Date().toISOString().split('T')[0];
        const { data: todayEntries } = await supabase
          .from('time_entries')
          .select('duration_minutes, is_billable')
          .eq('user_id', user.id)
          .gte('start_time', today + 'T00:00:00.000Z')
          .lte('start_time', today + 'T23:59:59.999Z');

        const dailyMinutes = todayEntries?.reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) || 0;
        const billableMinutes = todayEntries?.filter(e => e.is_billable).reduce((acc, entry) => acc + (entry.duration_minutes || 0), 0) || 0;

        teamData.push({
          user_id: user.id,
          user_name: `${user.first_name} ${user.last_name}`.trim(),
          active_timer: activeTimer as EnhancedTimeEntry,
          daily_hours: Math.round(dailyMinutes / 60 * 100) / 100,
          weekly_hours: 0, // TODO: Calcular semanal
          billable_hours: Math.round(billableMinutes / 60 * 100) / 100,
          current_project: activeTimer ? {
            type: activeTimer.lead_id ? 'lead' : activeTimer.mandate_id ? 'mandate' : 'general',
            name: activeTimer.lead?.name || activeTimer.mandate?.mandate_name || 'Trabajo general'
          } : undefined,
          productivity_score: 0.85, // TODO: Calcular score real
          last_activity: activeTimer?.start_time,
          status: activeTimer ? 'active' : (dailyMinutes > 0 ? 'break' : 'offline')
        });
      }

      return teamData;
    },
    refetchInterval: 30000 // Actualizar cada 30 segundos
  });

  return {
    teamData,
    isLoading
  };
};