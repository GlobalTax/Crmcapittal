
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Activity, Mail, Phone, Calendar } from 'lucide-react';
import { Contact } from '@/types/Contact';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactActivitySectionProps {
  contact: Contact;
}

export const ContactActivitySection = ({ contact }: ContactActivitySectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mock data - esto se reemplazaría con datos reales de actividades
  const activities = [
    { 
      id: '1', 
      type: 'email', 
      description: 'Email enviado: Propuesta comercial',
      date: new Date(Date.now() - 86400000), // Ayer
      icon: Mail 
    },
    { 
      id: '2', 
      type: 'call', 
      description: 'Llamada realizada: Seguimiento',
      date: new Date(Date.now() - 172800000), // Hace 2 días
      icon: Phone 
    },
    { 
      id: '3', 
      type: 'meeting', 
      description: 'Reunión programada',
      date: new Date(Date.now() + 86400000), // Mañana
      icon: Calendar 
    }
  ];

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'call': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                ACTIVIDADES ({activities.length})
              </h3>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/30">
                      <div className="mt-1">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                          >
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(activity.date, 'dd MMM', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin actividades recientes</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
