import React from 'react';
import { Valoracion } from '@/types/Valoracion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { formatCurrency } from '@/utils/format';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface ValoracionSummaryTabProps {
  valoracion: Valoracion;
}

export const ValoracionSummaryTab: React.FC<ValoracionSummaryTabProps> = ({ valoracion }) => {
  const phase = VALORACION_PHASES[valoracion.status];
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      default: return 'Baja';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estado y Progreso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{phase.icon}</div>
              <div>
                <h3 className="font-semibold">{valoracion.company_name}</h3>
                <p className="text-sm text-muted-foreground">{valoracion.client_name}</p>
              </div>
            </div>
            <Badge className={phase.bgColor + ' ' + phase.textColor}>
              {phase.label}
            </Badge>
          </div>
          
          {valoracion.priority && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Prioridad</span>
              <Badge variant={getPriorityColor(valoracion.priority)}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {getPriorityText(valoracion.priority)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fechas Clave
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
            <p className="text-sm">
              {format(new Date(valoracion.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
            <p className="text-sm">
              {format(new Date(valoracion.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
            </p>
          </div>
          
          {valoracion.estimated_delivery && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entrega Estimada</label>
              <p className="text-sm">
                {format(new Date(valoracion.estimated_delivery), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Valuation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resultados de Valoración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {valoracion.valoracion_ev && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <label className="text-sm font-medium text-muted-foreground">Enterprise Value (EV)</label>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(valoracion.valoracion_ev, valoracion.fee_currency)}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {valoracion.fee_quoted && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Honorarios Cotizados</label>
                <p className="text-lg font-semibold">
                  {formatCurrency(valoracion.fee_quoted, valoracion.fee_currency)}
                </p>
              </div>
            )}
            
            {valoracion.fee_charged && valoracion.fee_charged > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Honorarios Cobrados</label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(valoracion.fee_charged, valoracion.fee_currency)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};