import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, MapPin, Building2, User, Target, Clock, Euro, Users } from 'lucide-react';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BuyingMandateHighlightCard } from './BuyingMandateHighlightCard';

interface BuyingMandateDetailsSidebarProps {
  mandate: BuyingMandate;
  targets: MandateTarget[];
  onUpdate: (mandateId: string, status: BuyingMandate['status']) => Promise<any>;
}

export const BuyingMandateDetailsSidebar = ({
  mandate,
  targets,
  onUpdate
}: BuyingMandateDetailsSidebarProps) => {
  const getProgressStats = () => {
    const total = targets.length;
    const contacted = targets.filter(t => t.contacted).length;
    const interested = targets.filter(t => t.status === 'interested').length;
    const ndaSigned = targets.filter(t => t.status === 'nda_signed').length;
    
    return { total, contacted, interested, ndaSigned };
  };

  const stats = getProgressStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Highlight Cards */}
      <div className="grid grid-cols-2 gap-3">
        <BuyingMandateHighlightCard
          title="Estado"
          value={mandate.status === 'active' ? 'Activo' : 
                 mandate.status === 'paused' ? 'Pausado' :
                 mandate.status === 'completed' ? 'Completado' : 'Cancelado'}
          icon={Clock}
        />
        <BuyingMandateHighlightCard
          title="Targets Total"
          value={stats.total.toString()}
          icon={Target}
        />
        <BuyingMandateHighlightCard
          title="Contactados"
          value={stats.contacted.toString()}
          subtitle={`${stats.total > 0 ? Math.round((stats.contacted / stats.total) * 100) : 0}%`}
          icon={Users}
        />
        <BuyingMandateHighlightCard
          title="Interesados"
          value={stats.interested.toString()}
          icon={Building2}
        />
      </div>

      <Separator />

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <User className="h-4 w-4 mr-2" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Nombre</p>
            <p className="text-sm font-medium">{mandate.client_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contacto</p>
            <p className="text-sm">{mandate.client_contact}</p>
          </div>
          {mandate.client_email && (
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{mandate.client_email}</p>
            </div>
          )}
          {mandate.client_phone && (
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="text-sm">{mandate.client_phone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Criterios de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Sectores Objetivo</p>
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
              <p className="text-xs text-muted-foreground">Ubicaciones</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {mandate.target_locations.map((location, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(mandate.min_revenue || mandate.max_revenue) && (
            <div>
              <p className="text-xs text-muted-foreground">Rango de Facturación</p>
              <div className="flex items-center space-x-2 text-sm">
                <Euro className="h-3 w-3" />
                <span>
                  {mandate.min_revenue ? formatCurrency(mandate.min_revenue) : '0'} - {' '}
                  {mandate.max_revenue ? formatCurrency(mandate.max_revenue) : '∞'}
                </span>
              </div>
            </div>
          )}

          {(mandate.min_ebitda || mandate.max_ebitda) && (
            <div>
              <p className="text-xs text-muted-foreground">Rango de EBITDA</p>
              <div className="flex items-center space-x-2 text-sm">
                <Euro className="h-3 w-3" />
                <span>
                  {mandate.min_ebitda ? formatCurrency(mandate.min_ebitda) : '0'} - {' '}
                  {mandate.max_ebitda ? formatCurrency(mandate.max_ebitda) : '∞'}
                </span>
              </div>
            </div>
          )}

          {mandate.other_criteria && (
            <div>
              <p className="text-xs text-muted-foreground">Otros Criterios</p>
              <p className="text-sm">{mandate.other_criteria}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Fecha de Inicio</p>
            <p className="text-sm">
              {format(new Date(mandate.start_date), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
          {mandate.end_date && (
            <div>
              <p className="text-xs text-muted-foreground">Fecha de Finalización</p>
              <p className="text-sm">
                {format(new Date(mandate.end_date), 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Creado</p>
            <p className="text-sm">
              {format(new Date(mandate.created_at), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Última Actualización</p>
            <p className="text-sm">
              {format(new Date(mandate.updated_at), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assigned User */}
      {mandate.assigned_user_name && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <User className="h-4 w-4 mr-2" />
              Usuario Asignado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{mandate.assigned_user_name}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};