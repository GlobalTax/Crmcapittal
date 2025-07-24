import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, FileText, Building2, Calendar, Euro, MapPin } from 'lucide-react';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';
import { BuyingMandateHighlightCard } from '../BuyingMandateHighlightCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BuyingMandateOverviewTabProps {
  mandate: BuyingMandate;
  targets: MandateTarget[];
}

export const BuyingMandateOverviewTab = ({
  mandate,
  targets
}: BuyingMandateOverviewTabProps) => {
  const getProgressStats = () => {
    const total = targets.length;
    const contacted = targets.filter(t => t.contacted).length;
    const interested = targets.filter(t => t.status === 'interested').length;
    const ndaSigned = targets.filter(t => t.status === 'nda_signed').length;
    const inAnalysis = targets.filter(t => t.status === 'in_analysis').length;
    
    return { total, contacted, interested, ndaSigned, inAnalysis };
  };

  const stats = getProgressStats();

  const getRecentActivity = () => {
    return targets
      .filter(t => t.contact_date)
      .sort((a, b) => new Date(b.contact_date!).getTime() - new Date(a.contact_date!).getTime())
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      pending: 'Pendiente',
      contacted: 'Contactado',
      in_analysis: 'En Análisis',
      interested: 'Interesado',
      nda_signed: 'NDA Firmado',
      rejected: 'Rechazado',
      closed: 'Cerrado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusVariant = (status: string) => {
    const variantMap = {
      pending: 'secondary' as const,
      contacted: 'default' as const,
      in_analysis: 'default' as const,
      interested: 'default' as const,
      nda_signed: 'default' as const,
      rejected: 'destructive' as const,
      closed: 'outline' as const
    };
    return variantMap[status as keyof typeof variantMap] || 'secondary' as const;
  };

  return (
    <div className="space-y-6">
      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BuyingMandateHighlightCard
          title="Total Targets"
          value={stats.total.toString()}
          icon={Target}
        />
        <BuyingMandateHighlightCard
          title="Contactados"
          value={stats.contacted.toString()}
          subtitle={`${stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0}% del total`}
          icon={Users}
        />
        <BuyingMandateHighlightCard
          title="Interesados"
          value={stats.interested.toString()}
          subtitle={`${stats.contacted > 0 ? Math.round((stats.interested / stats.contacted) * 100) : 0}% conversión`}
          icon={Building2}
        />
        <BuyingMandateHighlightCard
          title="NDAs Firmados"
          value={stats.ndaSigned.toString()}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mandate Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Detalles del Mandato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <p className="text-sm font-medium">{mandate.client_name}</p>
              <p className="text-sm text-muted-foreground">{mandate.client_contact}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sectores Objetivo</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {mandate.target_sectors.map((sector, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>

            {mandate.target_locations && mandate.target_locations.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ubicaciones</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mandate.target_locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha Inicio</label>
                <p className="text-sm flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(mandate.start_date), 'dd MMM yyyy', { locale: es })}
                </p>
              </div>
              {mandate.end_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha Fin</label>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(mandate.end_date), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Euro className="h-5 w-5 mr-2" />
              Criterios Financieros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(mandate.min_revenue || mandate.max_revenue) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Facturación</label>
                <p className="text-sm">
                  {mandate.min_revenue ? formatCurrency(mandate.min_revenue) : '0'} - {' '}
                  {mandate.max_revenue ? formatCurrency(mandate.max_revenue) : 'Sin límite'}
                </p>
              </div>
            )}

            {(mandate.min_ebitda || mandate.max_ebitda) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">EBITDA</label>
                <p className="text-sm">
                  {mandate.min_ebitda ? formatCurrency(mandate.min_ebitda) : '0'} - {' '}
                  {mandate.max_ebitda ? formatCurrency(mandate.max_ebitda) : 'Sin límite'}
                </p>
              </div>
            )}

            {mandate.other_criteria && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Otros Criterios</label>
                <p className="text-sm">{mandate.other_criteria}</p>
              </div>
            )}

            {(!mandate.min_revenue && !mandate.max_revenue && !mandate.min_ebitda && !mandate.max_ebitda && !mandate.other_criteria) && (
              <p className="text-sm text-muted-foreground">No se han especificado criterios financieros</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((target) => (
                <div key={target.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{target.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Contactado: {format(new Date(target.contact_date!), 'dd MMM yyyy', { locale: es })}
                    </p>
                    {target.contact_method && (
                      <p className="text-xs text-muted-foreground">
                        Método: {target.contact_method}
                      </p>
                    )}
                  </div>
                  <Badge variant={getStatusVariant(target.status)} className="text-xs">
                    {getStatusLabel(target.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay actividad reciente
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};