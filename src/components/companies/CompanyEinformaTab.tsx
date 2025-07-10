import { Company } from '@/types/Company';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MapPin, Calendar, TrendingUp, Banknote, AlertCircle } from 'lucide-react';
import { EnrichmentButton } from './EnrichmentButton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyEinformaTabProps {
  company: Company;
}

export const CompanyEinformaTab = ({ company }: CompanyEinformaTabProps) => {
  // Fetch enrichment data
  const { data: enrichmentData, isLoading } = useQuery({
    queryKey: ['company-enrichments', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_enrichments')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrichment data:', error);
        throw error;
      }

      return data;
    },
  });

  const latestEnrichment = enrichmentData?.[0];
  const enrichmentTimestamp = latestEnrichment ? 
    formatDistanceToNow(new Date(latestEnrichment.created_at), { addSuffix: true, locale: es }) : 
    null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Datos de eInforma</h3>
          <p className="text-sm text-muted-foreground">
            Información empresarial enriquecida desde eInforma
          </p>
          {enrichmentTimestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Última actualización: {enrichmentTimestamp}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <EnrichmentButton company={company} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !latestEnrichment ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay datos de eInforma</h3>
            <p className="text-muted-foreground mb-4">
              {company.nif ? 
                'Esta empresa aún no ha sido enriquecida con datos de eInforma. Haz clic en el botón para obtener información adicional.' :
                'Esta empresa no tiene un NIF/CIF configurado. Añade un NIF para poder enriquecer con datos de eInforma.'
              }
            </p>
            {company.nif && <EnrichmentButton company={company} variant="default" />}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderEnrichmentData(latestEnrichment)}
        </div>
      )}
      
    </div>
  );

  function renderEnrichmentData(enrichment: any) {
    const data = enrichment.enrichment_data?.extractedData || enrichment.enrichment_data || {};
    
    return (
      <>
        {/* Company Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información General
            </CardTitle>
            <CardDescription>
              Confianza: {enrichment.confidence_score ? `${Math.round(enrichment.confidence_score)}%` : 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Razón Social</p>
                <p className="text-sm">{company.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NIF/CIF</p>
                <p className="text-sm">{data.nif || company.nif || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sector</p>
                <p className="text-sm">{data.sector || company.industry || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <Badge variant="outline">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Información Financiera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Facturación Anual</p>
                <p className="text-sm">
                  {data.revenue ? `€${data.revenue.toLocaleString()}` : 
                   company.annual_revenue ? `€${company.annual_revenue.toLocaleString()}` : 
                   'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empleados</p>
                <p className="text-sm">{data.employees || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Año de Constitución</p>
                <p className="text-sm">{data.founded_year || company.founded_year || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forma Jurídica</p>
                <p className="text-sm">{data.legal_form || 'No disponible'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Información de Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                <p className="text-sm">{data.address || company.address || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ciudad</p>
                <p className="text-sm">{data.city || company.city || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Provincia</p>
                <p className="text-sm">{data.province || company.state || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Código Postal</p>
                <p className="text-sm">{data.postal_code || company.postal_code || 'No disponible'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sitio Web</p>
                <p className="text-sm">{company.website || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                <p className="text-sm">{company.phone || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                <p className="text-sm">
                  {new Date(enrichment.updated_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fuente</p>
                <Badge variant="secondary">{enrichment.source || 'eInforma'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
};