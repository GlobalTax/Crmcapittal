
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar, 
  Edit,
  Clock,
  DollarSign,
  Globe,
  Linkedin
} from 'lucide-react';
import { TimeTracker } from '@/components/time-tracking/TimeTracker';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  contact_type: string;
  contact_priority?: string;
  sectors_of_interest?: string[];
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  linkedin_url?: string;
  website_url?: string;
  notes?: string;
  created_at: string;
  last_interaction_date?: string;
}

interface ContactDetailsViewProps {
  contact: Contact;
  onEdit: () => void;
}

export const ContactDetailsView = ({ contact, onEdit }: ContactDetailsViewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{contact.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{contact.contact_type}</Badge>
                {contact.contact_priority && (
                  <Badge className={`text-white ${getPriorityColor(contact.contact_priority)}`}>
                    {contact.contact_priority}
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={onEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{contact.email}</span>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{contact.phone}</span>
                </div>
              )}
              
              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="font-medium">{contact.company}</span>
                    {contact.position && (
                      <span className="text-gray-600 ml-2">- {contact.position}</span>
                    )}
                  </div>
                </div>
              )}

              {contact.linkedin_url && (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-gray-500" />
                  <a 
                    href={contact.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Perfil de LinkedIn
                  </a>
                </div>
              )}

              {contact.website_url && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a 
                    href={contact.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Sitio Web
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investment Profile */}
          {(contact.investment_capacity_min || contact.investment_capacity_max || contact.sectors_of_interest?.length) && (
            <Card>
              <CardHeader>
                <CardTitle>Perfil de Inversión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(contact.investment_capacity_min || contact.investment_capacity_max) && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>
                      Capacidad: {contact.investment_capacity_min ? formatCurrency(contact.investment_capacity_min) : '0'} - {contact.investment_capacity_max ? formatCurrency(contact.investment_capacity_max) : '∞'}
                    </span>
                  </div>
                )}
                
                {contact.sectors_of_interest && contact.sectors_of_interest.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Sectores de Interés:</p>
                    <div className="flex flex-wrap gap-2">
                      {contact.sectors_of_interest.map((sector, index) => (
                        <Badge key={index} variant="secondary">{sector}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Time Tracker */}
          <TimeTracker contactId={contact.id} compact={false} />

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-600">Creado:</span>
                  <span className="ml-2">
                    {new Date(contact.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                
                {contact.last_interaction_date && (
                  <div className="text-sm">
                    <span className="text-gray-600">Última interacción:</span>
                    <span className="ml-2">
                      {new Date(contact.last_interaction_date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
