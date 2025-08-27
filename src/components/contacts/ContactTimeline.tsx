import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Edit, 
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/Contact";
import { AddActivityDialog } from "./AddActivityDialog";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { logger } from "@/utils/productionLogger";

interface ContactActivity {
  id: string;
  contact_id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_data?: Record<string, string | number | boolean | null>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface ContactTimelineProps {
  contact: Contact;
  className?: string;
}

const ACTIVITY_ICONS = {
  contact_created: User,
  contact_updated: Edit,
  interaction_logged: MessageSquare,
  note_added: MessageSquare,
  task_created: Target,
  task_completed: CheckCircle,
  call_logged: Phone,
  email_sent: Mail,
  meeting_scheduled: Calendar,
  manual_activity: AlertCircle
};

const ACTIVITY_COLORS = {
  contact_created: 'bg-green-100 text-green-600',
  contact_updated: 'bg-blue-100 text-blue-600',
  interaction_logged: 'bg-purple-100 text-purple-600',
  note_added: 'bg-yellow-100 text-yellow-600',
  task_created: 'bg-orange-100 text-orange-600',
  task_completed: 'bg-green-100 text-green-600',
  call_logged: 'bg-indigo-100 text-indigo-600',
  email_sent: 'bg-red-100 text-red-600',
  meeting_scheduled: 'bg-teal-100 text-teal-600',
  manual_activity: 'bg-gray-100 text-gray-600'
};

export function ContactTimeline({ contact, className = "" }: ContactTimelineProps) {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, [contact.id]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_activities')
        .select('*')
        .eq('contact_id', contact.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities((data || []).map(activity => ({
        ...activity,
        activity_data: typeof activity.activity_data === 'object' ? activity.activity_data as Record<string, string | number | boolean | null> : {}
      })));
    } catch (error) {
      logger.error('Error loading activities', { error, contactId: contact.id });
      toast.error('Error al cargar las actividades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityAdded = () => {
    loadActivities();
    setShowAddActivity(false);
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.activity_type === filter;
  });

  const getActivityIcon = (activityType: string) => {
    const IconComponent = ACTIVITY_ICONS[activityType as keyof typeof ACTIVITY_ICONS] || AlertCircle;
    return IconComponent;
  };

  const getActivityBadgeColor = (activityType: string) => {
    return ACTIVITY_COLORS[activityType as keyof typeof ACTIVITY_COLORS] || ACTIVITY_COLORS.manual_activity;
  };

  const renderActivityData = (activity: ContactActivity) => {
    if (!activity.activity_data) return null;

    const data = activity.activity_data;
    
    if (activity.activity_type === 'contact_updated' && data.changes) {
      return (
        <div className="mt-2 p-2 bg-muted rounded text-xs">
          <strong>Cambios realizados:</strong>
          <ul className="mt-1 space-y-1">
            {Object.entries(data.changes).map(([field, change]: [string, { from?: string; to?: string }]) => (
              <li key={field} className="flex items-center gap-2">
                <span className="font-medium">{field}:</span>
                <span className="text-muted-foreground">{change.from || 'vacío'}</span>
                <span>→</span>
                <span className="font-medium">{change.to || 'vacío'}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (activity.activity_type === 'interaction_logged') {
      return (
        <div className="mt-2 p-2 bg-muted rounded text-xs">
          <div className="grid grid-cols-2 gap-2">
            {data.interaction_method && (
              <div><strong>Método:</strong> {data.interaction_method}</div>
            )}
            {data.duration_minutes && (
              <div><strong>Duración:</strong> {data.duration_minutes} min</div>
            )}
            {data.outcome && (
              <div className="col-span-2"><strong>Resultado:</strong> {data.outcome}</div>
            )}
            {data.next_action && (
              <div className="col-span-2"><strong>Próxima acción:</strong> {data.next_action}</div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const activityTypes = Array.from(new Set(activities.map(a => a.activity_type)));

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline de Actividades
          </CardTitle>
          <Button 
            onClick={() => setShowAddActivity(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir Actividad
          </Button>
        </div>
        
        {/* Activity Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas ({activities.length})
          </Button>
          {activityTypes.map(type => {
            const count = activities.filter(a => a.activity_type === type).length;
            return (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
              >
                {type.replace('_', ' ')} ({count})
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividades registradas</p>
                  <p className="text-sm">Las actividades aparecerán aquí automáticamente</p>
                </div>
              ) : (
                filteredActivities.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.activity_type);
                  const badgeColor = getActivityBadgeColor(activity.activity_type);
                  
                  return (
                    <div key={activity.id} className="relative">
                      {/* Timeline line */}
                      {index < filteredActivities.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border"></div>
                      )}
                      
                      <div className="flex gap-3">
                        {/* Activity icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${badgeColor}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        {/* Activity content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{activity.title}</h4>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                              )}
                              {renderActivityData(activity)}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <Badge variant="outline" className="text-xs">
                                {activity.activity_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.created_at), { 
                                  addSuffix: true, 
                                  locale: es 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Add Activity Dialog */}
      <AddActivityDialog
        open={showAddActivity}
        onOpenChange={setShowAddActivity}
        contact={contact}
        onActivityAdded={handleActivityAdded}
      />
    </Card>
  );
}