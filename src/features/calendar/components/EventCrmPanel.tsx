import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Clock, 
  MapPin, 
  Building, 
  Target, 
  User, 
  Phone, 
  Mail,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventCrmPanelProps {
  event: any;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCrmPanel: React.FC<EventCrmPanelProps> = ({
  event,
  onClose,
  onEdit,
  onDelete
}) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'call': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'task': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'appointment': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return '🤝';
      case 'call': return '📞';
      case 'task': return '✅';
      case 'appointment': return '📅';
      default: return '📅';
    }
  };

  // Mock CRM data - this would come from actual CRM queries
  const crmData = {
    deal: event.deal_id ? {
      id: event.deal_id,
      name: 'Deal ABC Corp',
      value: '€450,000',
      stage: 'Negociación',
      probability: 70,
      contact: 'John Doe',
      email: 'john@abccorp.com',
      phone: '+34 600 123 456'
    } : null,
    lead: event.lead_id ? {
      id: event.lead_id,
      name: event.lead_name || 'Lead Prospect',
      company: 'Tech Corp',
      status: 'Qualified',
      score: 85,
      contact: 'Jane Smith',
      email: 'jane@techcorp.com',
      phone: '+34 600 654 321'
    } : null,
    contact: event.contact_id ? {
      id: event.contact_id,
      name: 'Contact Person',
      company: 'Client Corp',
      role: 'CEO',
      email: 'contact@clientcorp.com',
      phone: '+34 600 789 123'
    } : null
  };

  return (
    <div className="w-96 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Detalles del Evento</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Event Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
              {event.title}
              <Badge variant="secondary" className={getEventTypeColor(event.event_type)}>
                {event.event_type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(event.start_date), 'dd MMM yyyy', { locale: es })} · {' '}
                {format(new Date(event.start_date), 'HH:mm')} - {format(new Date(event.end_date), 'HH:mm')}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}

            {event.description && (
              <div className="text-sm text-muted-foreground">
                <p>{event.description}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={onDelete}>
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CRM Context */}
        {crmData.deal && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4 text-blue-600" />
                Deal Vinculado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{crmData.deal.name}</span>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {crmData.deal.stage}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <p className="font-medium">{crmData.deal.value}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Probabilidad:</span>
                  <p className="font-medium">{crmData.deal.probability}%</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Contacto Principal</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmData.deal.contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmData.deal.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmData.deal.phone}</span>
                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver Deal Completo
              </Button>
            </CardContent>
          </Card>
        )}

        {crmData.lead && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-green-600" />
                Lead Vinculado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{crmData.lead.name}</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  {crmData.lead.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Empresa:</span>
                  <p className="font-medium">{crmData.lead.company}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Score:</span>
                  <p className="font-medium">{crmData.lead.score}/100</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Información de Contacto</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmData.lead.contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmData.lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmData.lead.phone}</span>
                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full">
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver Lead Completo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" variant="outline" className="w-full justify-start">
              <Mail className="h-3 w-3 mr-2" />
              Enviar Email
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              <Phone className="h-3 w-3 mr-2" />
              Programar Llamada
            </Button>
            <Button size="sm" variant="outline" className="w-full justify-start">
              <Clock className="h-3 w-3 mr-2" />
              Crear Seguimiento
            </Button>
          </CardContent>
        </Card>

        {/* Meeting Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notas de la Reunión</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea 
              className="w-full h-24 p-2 text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Agregar notas de la reunión..."
            />
            <Button size="sm" className="w-full mt-2">
              Guardar Notas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};