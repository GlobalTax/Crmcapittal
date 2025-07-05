import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/Lead';
import { Activity, Clock, Mail, Phone, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadActivityTabProps {
  lead: Lead;
}

export const LeadActivityTab = ({ lead }: LeadActivityTabProps) => {
  // Mock activity data - in a real app, this would come from an API
  const mockActivities = [
    {
      id: '1',
      type: 'email_sent',
      title: 'Email enviado',
      description: 'Welcome email sent to lead',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: Mail,
      color: 'hsl(213, 94%, 68%)'
    },
    {
      id: '2',
      type: 'lead_created',
      title: 'Lead creado',
      description: `Lead created from ${lead.source}`,
      date: new Date(lead.created_at),
      icon: Activity,
      color: 'hsl(158, 100%, 38%)'
    },
    {
      id: '3',
      type: 'score_updated',
      title: 'Puntuación actualizada',
      description: `Lead score updated to ${lead.lead_score}`,
      date: new Date(lead.updated_at),
      icon: Activity,
      color: 'hsl(42, 100%, 50%)'
    }
  ];

  // Add contact activities if they exist
  if (lead.first_contact_date) {
    mockActivities.push({
      id: '4',
      type: 'first_contact',
      title: 'Primer contacto',
      description: 'First contact established with lead',
      date: new Date(lead.first_contact_date),
      icon: Phone,
      color: 'hsl(30, 100%, 50%)'
    });
  }

  if (lead.last_contact_date && lead.last_contact_date !== lead.first_contact_date) {
    mockActivities.push({
      id: '5',
      type: 'last_contact',
      title: 'Último contacto',
      description: 'Most recent contact with lead',
      date: new Date(lead.last_contact_date),
      icon: Phone,
      color: 'hsl(30, 100%, 50%)'
    });
  }

  // Sort activities by date (most recent first)
  const sortedActivities = mockActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Track all interactions and changes for this lead
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {sortedActivities.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === sortedActivities.length - 1;
          
          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div 
                  className="absolute left-6 top-12 w-0.5 h-12 bg-border"
                  style={{ height: '60px' }}
                />
              )}
              
              {/* Activity item */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background"
                  style={{ borderColor: activity.color }}
                >
                  <Icon 
                    className="h-5 w-5" 
                    style={{ color: activity.color }}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(activity.date, 'dd MMM yyyy, HH:mm', { locale: es })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{sortedActivities.length}</p>
              <p className="text-sm text-muted-foreground">Total Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {lead.follow_up_count || 0}
              </p>
              <p className="text-sm text-muted-foreground">Follow-ups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {lead.email_opens || 0}
              </p>
              <p className="text-sm text-muted-foreground">Email Opens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {lead.website_visits || 0}
              </p>
              <p className="text-sm text-muted-foreground">Site Visits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Actions */}
      {lead.next_follow_up_date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Follow-up scheduled</h4>
                <p className="text-sm text-muted-foreground">
                  Next contact scheduled for {format(new Date(lead.next_follow_up_date), 'dd MMMM yyyy', { locale: es })}
                </p>
              </div>
              <Badge variant="outline">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for activities */}
      {sortedActivities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No activities yet</h3>
            <p className="text-muted-foreground mb-4">
              Start engaging with this lead to see activity here
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log First Activity
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};