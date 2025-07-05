import React, { useState, useEffect } from 'react';
import { Deal } from '@/types/Deal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  MessageSquare, 
  User, 
  Edit, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  created_at: string;
  created_by?: string;
}

interface DealActivityTabProps {
  deal: Deal;
}

const ACTIVITY_ICONS = {
  deal_created: User,
  deal_updated: Edit,
  stage_changed: CheckCircle,
  note_added: MessageSquare,
  manual_activity: AlertCircle
};

const ACTIVITY_COLORS = {
  deal_created: 'bg-green-100 text-green-600 border-green-200',
  deal_updated: 'bg-blue-100 text-blue-600 border-blue-200',
  stage_changed: 'bg-purple-100 text-purple-600 border-purple-200',
  note_added: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  manual_activity: 'bg-gray-100 text-gray-600 border-gray-200'
};

export const DealActivityTab = ({ deal }: DealActivityTabProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [deal.id]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      // For now, create some mock activities based on deal data
      const mockActivities: Activity[] = [
        {
          id: '1',
          activity_type: 'deal_created',
          title: 'Deal created',
          description: `${deal.title} was created`,
          created_at: deal.createdAt,
          created_by: deal.ownerId
        }
      ];

      if (deal.updatedAt !== deal.createdAt) {
        mockActivities.unshift({
          id: '2',
          activity_type: 'deal_updated',
          title: 'Deal updated',
          description: 'Deal information was updated',
          created_at: deal.updatedAt,
          created_by: deal.ownerId
        });
      }

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    return ACTIVITY_ICONS[activityType as keyof typeof ACTIVITY_ICONS] || AlertCircle;
  };

  const getActivityColor = (activityType: string) => {
    return ACTIVITY_COLORS[activityType as keyof typeof ACTIVITY_COLORS] || ACTIVITY_COLORS.manual_activity;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Activity Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Activity Timeline</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Log Activity
        </Button>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activities recorded</p>
              <p className="text-xs">Activities will appear here as the deal progresses</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.activity_type);
              const colorClasses = getActivityColor(activity.activity_type);
              
              return (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-border"></div>
                  )}
                  
                  <div className="flex gap-3">
                    {/* Activity icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${colorClasses}`}>
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
    </div>
  );
};