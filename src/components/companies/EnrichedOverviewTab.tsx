import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Globe, Phone, Mail, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Company } from '@/types/Company';
import { useCompanyStats } from '@/hooks/useCompanyStats';
import { useCompanyEnrichments } from '@/hooks/useCompanyEnrichments';
import { useCompanyProfileScore } from '@/hooks/useCompanyProfileScore';
import { CompanyProfileScore } from '@/components/companies/CompanyProfileScore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EnrichedOverviewTabProps {
  company: Company;
}

export const EnrichedOverviewTab = ({ company }: EnrichedOverviewTabProps) => {
  const { stats, isLoading: statsLoading } = useCompanyStats(company.id, company.name);
  const { enrichmentData, isLoading: enrichmentLoading } = useCompanyEnrichments(company.id);
  const { score, level, color, completedFields, missingFields } = useCompanyProfileScore(company, enrichmentData);

  // Fetch latest valoraciones for company
  const { data: valoraciones } = useQuery({
    queryKey: ['company-valoraciones', company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('valoraciones')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    }
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Grid 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna Izquierda - Info Empresa */}
        <div className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Industria</p>
                  <p className="font-medium">{company.industry || 'No especificada'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tamaño</p>
                  <p className="font-medium">{company.company_size || 'No especificado'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Ciudad</p>
                  <p className="font-medium flex items-center gap-1">
                    {company.city && <MapPin className="h-4 w-4" />}
                    {company.city || 'No especificada'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">País</p>
                  <p className="font-medium">{company.country || 'No especificado'}</p>
                </div>
              </div>
              
              {/* Enlaces y contacto */}
              <div className="border-t pt-4 space-y-3">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Métricas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats?.contacts_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Contactos</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats?.deals_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Deals Activos</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats?.pipeline_value ? formatCurrency(stats.pipeline_value) : '€0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue Pipeline</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {company.last_activity_date ? formatDate(company.last_activity_date) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Último Contacto</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perfil Score */}
          <CompanyProfileScore 
            company={company} 
            enrichmentData={enrichmentData}
          />
        </div>

        {/* Columna Derecha - Métricas Clave */}
        <div className="space-y-6">
          
          {/* Widget eInforma Compacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Datos eInforma</span>
                <Badge variant="outline">Actualizado</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrichmentLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              ) : enrichmentData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sector</p>
                      <p className="font-medium">{enrichmentData.sector || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Empleados</p>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {enrichmentData.employees || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Facturación</p>
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {enrichmentData.revenue || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Año Constitución</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {enrichmentData.constitution_year || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {enrichmentData.location && (
                    <div className="border-t pt-3">
                      <p className="text-sm text-muted-foreground">Ubicación</p>
                      <p className="font-medium">{enrichmentData.location}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No hay datos de eInforma disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabla Valoraciones Resumida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Valoraciones Recientes</span>
                <Badge variant="outline">{valoraciones?.length || 0} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {valoraciones && valoraciones.length > 0 ? (
                <div className="space-y-3">
                  {valoraciones.map((valoracion) => (
                    <div 
                      key={valoracion.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{valoracion.valoracion_method}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(valoracion.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {valoracion.enterprise_value ? formatCurrency(valoracion.enterprise_value) : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">Valor Empresa</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No hay valoraciones disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Comercial */}
          <Card>
            <CardHeader>
              <CardTitle>Información Comercial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Anual</p>
                  <p className="font-medium">
                    {company.annual_revenue ? formatCurrency(company.annual_revenue) : 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium">{company.owner_name || 'Sin asignar'}</p>
                </div>
              </div>
              
              {/* Estado y tipo */}
              <div className="border-t pt-3 space-y-2">
                <p className="text-sm text-muted-foreground">Estado y Clasificación</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">{company.company_status}</Badge>
                  <Badge variant="secondary">{company.company_type}</Badge>
                  {company.is_target_account && <Badge variant="outline">Cuenta Objetivo</Badge>}
                  {company.is_key_account && <Badge variant="outline">Cuenta Clave</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};