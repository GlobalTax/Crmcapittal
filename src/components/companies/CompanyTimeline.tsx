import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, User, Calendar, StickyNote, FileText } from 'lucide-react';
import { Company } from '@/types/Company';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { logger } from '@/utils/productionLogger';

interface CompanyTimelineProps {
  company: Company;
}

interface CompanyActivity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_data?: any;
  created_at: string;
  created_by?: string;
}

export const CompanyTimeline = ({ company }: CompanyTimelineProps) => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['company-activities', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_activities')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch company activities', { 
          error: error.message, 
          companyId: company.id, 
          companyName: company.name 
        });
        throw error;
      }

      return data as CompanyActivity[];
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company_created':
        return Building2;
      case 'company_updated':
        return User;
      case 'note_added':
        return StickyNote;
      case 'file_uploaded':
        return FileText;
      default:
        return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'company_created':
        return 'bg-blue-500';
      case 'company_updated':
        return 'bg-green-500';
      case 'note_added':
        return 'bg-yellow-500';
      case 'file_uploaded':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay actividad aún
        </h3>
        <p className="text-muted-foreground">
          La actividad aparecerá aquí cuando se realicen interacciones
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Cronología de Actividad</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.activity_type);
          const isLast = index === activities.length - 1;
          
          return (
            <div key={activity.id} className="relative flex items-start gap-4">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-px h-full bg-border"></div>
              )}
              
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getActivityColor(activity.activity_type)} flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getRelativeTime(activity.created_at)}
                  </p>
                </div>
                
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};