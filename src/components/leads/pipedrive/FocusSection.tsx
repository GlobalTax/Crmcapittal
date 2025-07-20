
import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Calendar, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/Lead';

interface FocusSectionProps {
  lead: Lead;
}

export const FocusSection = ({ lead }: FocusSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const upcomingActivities = [
    {
      id: '1',
      type: 'call',
      title: 'Llamada de seguimiento',
      date: '2025-01-22',
      time: '10:00',
      icon: Phone
    },
    {
      id: '2', 
      type: 'meeting',
      title: 'Reunión de presentación',
      date: '2025-01-24',
      time: '15:30',
      icon: Calendar
    }
  ];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            ENFOQUE
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {/* Add Activity Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-muted-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir actividad
            </Button>

            {/* Upcoming Activities */}
            {upcomingActivities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Próximas actividades</h4>
                {upcomingActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div 
                      key={activity.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                        <IconComponent className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {activity.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString('es-ES')} a las {activity.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
