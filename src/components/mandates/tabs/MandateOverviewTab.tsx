import React from 'react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { MandateHighlightCard } from '../MandateHighlightCard';
import { MandateProgressBar } from '../MandateProgressBar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Euro, User, Target, Calendar, MessageSquare, Building2, MapPin, TrendingUp } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateOverviewTabProps {
  mandate: BuyingMandate;
}

export const MandateOverviewTab = ({ mandate }: MandateOverviewTabProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': '#00C48C',
      'paused': '#FFB300',
      'completed': '#1E88E5',
      'cancelled': '#EF5350'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Activo',
      'paused': 'Pausado',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getDaysActive = () => {
    const startDate = new Date(mandate.start_date);
    const endDate = mandate.end_date ? new Date(mandate.end_date) : new Date();
    return differenceInDays(endDate, startDate);
  };

  const formatRange = (min?: number, max?: number) => {
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min) return `Desde ${formatCurrency(min)}`;
    if (max) return `Hasta ${formatCurrency(max)}`;
    return 'No especificado';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        <MandateHighlightCard
          title="Estado del Mandato"
          icon={Target}
          value={
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(mandate.status) }}
                />
                <Badge variant="secondary" className="text-xs">
                  {getStatusLabel(mandate.status)}
                </Badge>
              </div>
              <MandateProgressBar status={mandate.status} />
            </div>
          }
          subtitle={`${getDaysActive()} días activo`}
        />

        <MandateHighlightCard
          title="Rango de Facturación"
          icon={Euro}
          value={
            <span className="text-success font-semibold">
              {formatRange(mandate.min_revenue, mandate.max_revenue)}
            </span>
          }
          subtitle="Criterio objetivo"
        />

        <MandateHighlightCard
          title="Sectores Objetivo"
          icon={Building2}
          value={
            <span className="font-semibold">
              {mandate.target_sectors.length} sectores
            </span>
          }
          subtitle={mandate.target_sectors.slice(0, 2).join(', ')}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MandateHighlightCard
          title="EBITDA Objetivo"
          icon={TrendingUp}
          value={formatRange(mandate.min_ebitda, mandate.max_ebitda)}
          subtitle="Rango de rentabilidad"
        />

        <MandateHighlightCard
          title="Duración"
          icon={Calendar}
          value={`${getDaysActive()} días`}
          subtitle={`Desde ${format(new Date(mandate.start_date), 'dd MMM yyyy', { locale: es })}`}
        />
      </div>

      {/* Client Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Información del Cliente</h3>
        <div className="bg-neutral-0 border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{mandate.client_name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contacto Principal</label>
              <p className="text-sm mt-1">{mandate.client_contact}</p>
            </div>
            {mandate.client_email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm mt-1">
                  <a 
                    href={`mailto:${mandate.client_email}`}
                    className="text-primary hover:underline"
                  >
                    {mandate.client_email}
                  </a>
                </p>
              </div>
            )}
            {mandate.client_phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                <p className="text-sm mt-1">
                  <a 
                    href={`tel:${mandate.client_phone}`}
                    className="text-primary hover:underline"
                  >
                    {mandate.client_phone}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Criteria */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Criterios de Búsqueda</h3>
        <div className="bg-neutral-0 border border-border rounded-lg p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Sectores Objetivo</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {mandate.target_sectors.map((sector) => (
                <Badge key={sector} variant="outline" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
          
          {mandate.target_locations && mandate.target_locations.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ubicaciones</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {mandate.target_locations.map((location) => (
                  <Badge key={location} variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {mandate.other_criteria && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Criterios Adicionales</label>
              <p className="text-sm mt-1 text-foreground">{mandate.other_criteria}</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Criteria */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Criterios Financieros</h3>
        <div className="bg-neutral-0 border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Facturación Objetivo</label>
              <p className="text-sm mt-1 font-medium">{formatRange(mandate.min_revenue, mandate.max_revenue)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">EBITDA Objetivo</label>
              <p className="text-sm mt-1 font-medium">{formatRange(mandate.min_ebitda, mandate.max_ebitda)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Information */}
      {mandate.assigned_user_name && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Asignación</h3>
          <div className="bg-neutral-0 border border-border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-muted">
                  {mandate.assigned_user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{mandate.assigned_user_name}</p>
                <p className="text-xs text-muted-foreground">Responsable del mandato</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Actividad Reciente</h3>
        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
          <p className="text-xs text-muted-foreground">
            Las actividades aparecerán aquí mientras trabajas en este mandato
          </p>
        </div>
      </div>
    </div>
  );
};