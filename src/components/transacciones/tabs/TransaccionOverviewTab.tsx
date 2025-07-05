import React from 'react';
import { Transaccion } from '@/types/Transaccion';
import { TransaccionHighlightCard } from '../TransaccionHighlightCard';
import { TransaccionProgressBar } from '../TransaccionProgressBar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Euro, User, TrendingUp, Calendar, MessageSquare, Building2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransaccionOverviewTabProps {
  transaccion: Transaccion;
}

export const TransaccionOverviewTab = ({ transaccion }: TransaccionOverviewTabProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Sin valor definido';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStageColor = (stage?: string) => {
    const colors: Record<string, string> = {
      'Lead': '#1E88E5',
      'In Progress': '#FFB300',
      'Won': '#00C48C',
      'Lost': '#EF5350'
    };
    return colors[stage || ''] || '#6B7280';
  };

  const getProbability = (stage?: string) => {
    const probabilities: Record<string, number> = {
      'Lead': 25,
      'In Progress': 50,
      'Won': 100,
      'Lost': 0
    };
    return probabilities[stage || ''] || 25;
  };

  return (
    <div className="space-y-6">
      {/* Highlights Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        <TransaccionHighlightCard
          title="Etapa de la Transacción"
          icon={TrendingUp}
          value={
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStageColor(transaccion.stage?.name) }}
                />
                <Badge variant="secondary" className="text-xs">
                  {transaccion.stage?.name || 'Sin etapa'}
                </Badge>
              </div>
              <TransaccionProgressBar stage={transaccion.stage?.name || 'Lead'} />
            </div>
          }
          subtitle={`${getProbability(transaccion.stage?.name)}% probabilidad`}
        />

        <TransaccionHighlightCard
          title="Valor de la Transacción"
          icon={Euro}
          value={
            <span className="text-success font-semibold">
              {formatCurrency(transaccion.valor_transaccion)}
            </span>
          }
        />

        <TransaccionHighlightCard
          title="Propietario"
          icon={User}
          value={
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-muted">
                  {transaccion.propietario_transaccion?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{transaccion.propietario_transaccion || 'Sin asignar'}</span>
            </div>
          }
        />
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-2 gap-4">
        <TransaccionHighlightCard
          title="Próxima Tarea"
          icon={Calendar}
          value="No hay tareas programadas"
          subtitle="Crea una tarea para hacer seguimiento del progreso"
        />

        <TransaccionHighlightCard
          title="Última Interacción"
          icon={MessageSquare}
          value="Sin interacciones aún"
          subtitle="Registra una interacción para construir el timeline"
        />
      </div>

      {/* Company Information */}
      {transaccion.company && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Información de la Empresa</h3>
          <div className="bg-neutral-0 border border-border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{transaccion.company.name}</p>
                </div>
                {transaccion.company.industry && (
                  <p className="text-xs text-muted-foreground">{transaccion.company.industry}</p>
                )}
              </div>
              {transaccion.company.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sitio Web</label>
                  <p className="text-sm mt-1">
                    <a 
                      href={transaccion.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {transaccion.company.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      {transaccion.contact && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Información del Contacto</h3>
          <div className="bg-neutral-0 border border-border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contacto Principal</label>
                <p className="text-sm mt-1 font-medium">{transaccion.contact.name}</p>
                {transaccion.contact.position && (
                  <p className="text-xs text-muted-foreground">{transaccion.contact.position}</p>
                )}
              </div>
              {transaccion.contact.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm mt-1">
                    <a 
                      href={`mailto:${transaccion.contact.email}`}
                      className="text-primary hover:underline"
                    >
                      {transaccion.contact.email}
                    </a>
                  </p>
                </div>
              )}
              {transaccion.contact.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                  <p className="text-sm mt-1">
                    <a 
                      href={`tel:${transaccion.contact.phone}`}
                      className="text-primary hover:underline"
                    >
                      {transaccion.contact.phone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {(transaccion.ebitda || transaccion.ingresos || transaccion.multiplicador) && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Resumen Financiero</h3>
          <div className="bg-neutral-0 border border-border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {transaccion.ebitda && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">EBITDA</label>
                  <p className="text-sm mt-1 font-medium">{formatCurrency(transaccion.ebitda)}</p>
                </div>
              )}
              {transaccion.ingresos && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ingresos</label>
                  <p className="text-sm mt-1 font-medium">{formatCurrency(transaccion.ingresos)}</p>
                </div>
              )}
              {transaccion.multiplicador && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Multiplicador</label>
                  <p className="text-sm mt-1 font-medium">{transaccion.multiplicador}x</p>
                </div>
              )}
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
            Las actividades aparecerán aquí mientras interactúas con esta transacción
          </p>
        </div>
      </div>
    </div>
  );
};