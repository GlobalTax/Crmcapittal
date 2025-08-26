import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Phone, MapPin } from 'lucide-react';
import { HubSpotCompany } from '../types';
import { HubSpotService } from '../services/HubSpotService';

interface CompaniesTabProps {
  companies: HubSpotCompany[];
}

export function CompaniesTab({ companies }: CompaniesTabProps) {
  return (
    <div className="grid gap-4">
      {companies.map((company) => (
        <Card key={company.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {company.name}
                  <Badge variant="secondary" className="text-xs">
                    ID: {company.hubspot_id}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {company.industry && (
                    <span className="inline-flex items-center gap-1">
                      <Badge variant="outline">{company.industry}</Badge>
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{company.total_contacts} contactos</div>
                <div>{company.total_deals} deals</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {company.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {company.phone}
                  </div>
                )}
                {(company.city || company.state || company.country) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                {company.annual_revenue && (
                  <div>
                    <strong>Facturación:</strong> {HubSpotService.formatCurrency(company.annual_revenue)}
                  </div>
                )}
                <div>
                  <strong>Tamaño:</strong> {company.company_size} empleados
                </div>
                {company.founded_year && (
                  <div>
                    <strong>Fundada:</strong> {company.founded_year}
                  </div>
                )}
                <div>
                  <strong>Importada:</strong> {HubSpotService.formatDate(company.created_at)}
                </div>
              </div>
            </div>
            {company.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">{company.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}