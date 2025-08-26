import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Phone, Globe } from 'lucide-react';
import { HubSpotContact } from '../types';
import { HubSpotService } from '../services/HubSpotService';

interface ContactsTabProps {
  contacts: HubSpotContact[];
}

export function ContactsTab({ contacts }: ContactsTabProps) {
  return (
    <div className="grid gap-4">
      {contacts.map((contact) => (
        <Card key={contact.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {contact.name}
                  <Badge variant="secondary" className="text-xs">
                    ID: {contact.hubspot_id}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {contact.position && <span>{contact.position}</span>}
                  {contact.company_name && (
                    <span className="ml-2">
                      en <strong>{contact.company_name}</strong>
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-1">
                {contact.lifecycle_stage && (
                  <Badge variant="outline">{contact.lifecycle_stage}</Badge>
                )}
                {contact.is_active ? (
                  <Badge variant="default">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </div>
                )}
                {contact.company_industry && (
                  <div className="text-sm">
                    <strong>Industria:</strong> {contact.company_industry}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                {contact.last_interaction_date && (
                  <div>
                    <strong>Última interacción:</strong> {HubSpotService.formatDate(contact.last_interaction_date)}
                  </div>
                )}
                <div>
                  <strong>Importado:</strong> {HubSpotService.formatDate(contact.created_at)}
                </div>
                {contact.company_domain && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={`https://${contact.company_domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {contact.company_domain}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}