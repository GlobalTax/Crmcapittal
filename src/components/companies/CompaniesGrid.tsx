
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, MapPin, Users, Briefcase, Phone, Mail } from 'lucide-react';
import { Company } from '@/types/Company';
import { calculateProfileScore, formatRevenue, formatLocation } from '@/utils/profileScore';

interface CompaniesGridProps {
  companies: (Company & { 
    enrichment_data?: any; 
    contacts_count?: number; 
    opportunities_count?: number;
    sector?: string;
  })[];
  onCompanyClick?: (company: Company) => void;
  isLoading?: boolean;
}

export const CompaniesGrid = ({
  companies,
  onCompanyClick,
  isLoading
}: CompaniesGridProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      prospecto: 'bg-blue-100 text-blue-800',
      cliente: 'bg-green-100 text-green-800',
      perdida: 'bg-red-100 text-red-800',
      activa: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No hay empresas</h3>
        <p className="text-muted-foreground">Comienza agregando tu primera empresa.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {companies.map((company) => {
        const profileScore = calculateProfileScore(
          company, 
          company.enrichment_data, 
          company.contacts_count || 0, 
          company.opportunities_count || 0
        );

        return (
          <Card 
            key={company.id} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => onCompanyClick?.(company)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(company.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{company.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {company.domain || 'Sin dominio'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(company.company_status)}`}
                    >
                      {company.company_status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{profileScore.icon}</span>
                      <span className={`text-xs font-medium ${profileScore.color}`}>
                        {profileScore.score}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                {company.sector || company.industry ? (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{company.sector || company.industry}</span>
                  </div>
                ) : null}

                {(company.city || company.state) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      {formatLocation(company.city, company.state)}
                    </span>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{company.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{company.contacts_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{company.opportunities_count || 0}</span>
                  </div>
                </div>
                
                {(company.annual_revenue || company.enrichment_data?.company_data?.revenue) && (
                  <div className="text-xs font-medium text-right">
                    {formatRevenue(company.annual_revenue || company.enrichment_data?.company_data?.revenue)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
