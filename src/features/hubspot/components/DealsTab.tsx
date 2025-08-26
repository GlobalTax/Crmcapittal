import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Handshake, Mail } from 'lucide-react';
import { HubSpotDeal } from '../types';
import { HubSpotService } from '../services/HubSpotService';

interface DealsTabProps {
  deals: HubSpotDeal[];
}

export function DealsTab({ deals }: DealsTabProps) {
  return (
    <div className="grid gap-4">
      {deals.map((deal) => (
        <Card key={deal.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  {deal.deal_name}
                  <Badge variant="secondary" className="text-xs">
                    ID: {deal.hubspot_id}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {deal.contact_name && (
                    <span>Contacto: <strong>{deal.contact_name}</strong></span>
                  )}
                  {deal.company_name && (
                    <span className="ml-2">
                      en <strong>{deal.company_name}</strong>
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                {deal.deal_value && (
                  <div className="text-lg font-bold text-green-600">
                    {HubSpotService.formatCurrency(deal.deal_value)}
                  </div>
                )}
                {deal.is_active ? (
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
                <div className="text-sm">
                  <strong>Tipo:</strong> {deal.deal_type}
                </div>
                {deal.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <a 
                      href={`mailto:${deal.contact_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {deal.contact_email}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                {deal.close_date && (
                  <div>
                    <strong>Fecha de cierre:</strong> {HubSpotService.formatDate(deal.close_date)}
                  </div>
                )}
                <div>
                  <strong>Importado:</strong> {HubSpotService.formatDate(deal.created_at)}
                </div>
              </div>
            </div>
            {deal.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">{deal.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}