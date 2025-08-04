import { useState, useEffect } from 'react';
import { UnifiedActivity, ActivityEntityType, DayGroup, UnifiedTimelineFilters } from '@/types/UnifiedActivity';
import { 
  transformLeadInteractions, 
  transformMandateActivities, 
  transformReconversionLogs, 
  transformValoracionLogs,
  transformWinbackAttempts
} from '@/utils/activityTransformers';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export interface UseUnifiedTimelineProps {
  entityType: ActivityEntityType;
  entityId: string;
  filters?: UnifiedTimelineFilters;
}

export function useUnifiedTimeline({ entityType, entityId, filters }: UseUnifiedTimelineProps) {
  const [allActivities, setAllActivities] = useState<UnifiedActivity[]>([]);
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Mock data for now - replace with actual data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const activities: UnifiedActivity[] = [];

        // Real data based on entity type
        if (entityType === 'lead') {
          // Fetch lead interactions
          try {
            const { data: leadInteractions } = await supabase
              .from('contact_interactions')
              .select('*')
              .eq('lead_id', entityId)
              .order('interaction_date', { ascending: false });

            if (leadInteractions) {
              // Transform contact_interactions to expected LeadInteraction format
              const transformedInteractions = leadInteractions.map(interaction => {
                const mapType = (type: string): 'email' | 'llamada' | 'reunion' | 'nota' | 'task' => {
                  const typeMap: Record<string, 'email' | 'llamada' | 'reunion' | 'nota' | 'task'> = {
                    'email': 'email',
                    'call': 'llamada',
                    'meeting': 'reunion',
                    'note': 'nota',
                    'task': 'task',
                    'phone': 'llamada',
                    'general': 'nota'
                  };
                  return typeMap[type] || 'nota';
                };
                
                return {
                  id: interaction.id,
                  tipo: mapType(interaction.interaction_type || 'general'),
                  detalle: interaction.description || interaction.subject || '',
                  fecha: interaction.interaction_date || interaction.created_at,
                  lead_id: interaction.lead_id || entityId,
                  created_at: interaction.created_at,
                  updated_at: interaction.created_at,
                  user_id: interaction.created_by
                };
              });
              activities.push(...transformLeadInteractions(transformedInteractions, entityId));
            }
          } catch (err) {
            console.error('Error fetching lead interactions:', err);
          }

          // Fetch winback attempts for leads
          try {
            const { data: winbackAttempts } = await supabase
              .from('winback_attempts')
              .select('*')
              .eq('lead_id', entityId)
              .order('scheduled_date', { ascending: false });

            if (winbackAttempts) {
              activities.push(...transformWinbackAttempts(winbackAttempts, entityId));
            }
          } catch (err) {
            console.error('Error fetching winback attempts:', err);
          }
        }

        if (entityType === 'mandate') {
          // Mock mandate activities
          const mockMandateActivities = [
            {
              id: '1',
              type: 'target_created',
              title: 'Nuevo target añadido',
              description: 'Se añadió una nueva empresa objetivo',
              user: 'Usuario',
              timestamp: new Date().toISOString(),
              details: {}
            }
          ];
          activities.push(...transformMandateActivities(mockMandateActivities, entityId));
        }

        if (entityType === 'reconversion') {
          // Mock reconversion logs
          const mockReconversionLogs = [
            {
              id: '1',
              action_type: 'created',
              action_title: 'Reconversión creada',
              action_description: 'Nueva reconversión iniciada',
              created_at: new Date().toISOString(),
              metadata: {}
            }
          ];
          activities.push(...transformReconversionLogs(mockReconversionLogs, entityId));
        }

        if (entityType === 'valoracion') {
          // Mock valoracion logs
          const mockValorationLogs = [
            {
              id: '1',
              event_type: 'access_granted',
              description: 'Acceso concedido al documento',
              user_email: 'user@example.com',
              created_at: new Date().toISOString(),
              severity: 'medium',
              metadata: {}
            }
          ];
          activities.push(...transformValoracionLogs(mockValorationLogs, entityId));
        }

        // Apply filters
        let filteredActivities = activities;

        if (filters?.type && filters.type.length > 0) {
          filteredActivities = filteredActivities.filter(activity => 
            filters.type!.includes(activity.type)
          );
        }

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredActivities = filteredActivities.filter(activity =>
            activity.title.toLowerCase().includes(searchLower) ||
            activity.description?.toLowerCase().includes(searchLower) ||
            activity.user_name?.toLowerCase().includes(searchLower)
          );
        }

        if (filters?.severity && filters.severity.length > 0) {
          filteredActivities = filteredActivities.filter(activity =>
            activity.severity && filters.severity!.includes(activity.severity)
          );
        }

        if (filters?.dateRange) {
          const startDate = parseISO(filters.dateRange.start);
          const endDate = parseISO(filters.dateRange.end);
          filteredActivities = filteredActivities.filter(activity => {
            const activityDate = parseISO(activity.timestamp);
            return activityDate >= startDate && activityDate <= endDate;
          });
        }

        // Sort by timestamp (newest first)
        filteredActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setAllActivities(filteredActivities);

        // Group by day
        const groups = groupActivitiesByDay(filteredActivities);
        setDayGroups(groups);

      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (entityId) {
      fetchData();
    } else {
      setAllActivities([]);
      setDayGroups([]);
      setIsLoading(false);
    }
  }, [entityType, entityId, filters]);

  return {
    activities: allActivities,
    dayGroups,
    isLoading,
    error,
    totalCount: allActivities.length
  };
}

// Helper function to group activities by day
function groupActivitiesByDay(activities: UnifiedActivity[]): DayGroup[] {
  const groups: Record<string, UnifiedActivity[]> = {};

  activities.forEach(activity => {
    const date = format(parseISO(activity.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
  });

  return Object.entries(groups)
    .map(([date, dayActivities]) => ({
      date,
      activities: dayActivities,
      count: dayActivities.length
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Helper function to format day group headers
export function formatDayGroupHeader(dateString: string): string {
  const date = parseISO(dateString);
  const today = startOfDay(new Date());
  const activityDate = startOfDay(date);

  if (isSameDay(activityDate, today)) {
    return 'Hoy';
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (isSameDay(activityDate, yesterday)) {
    return 'Ayer';
  }

  return format(date, 'EEEE, dd MMMM yyyy', { locale: es });
}