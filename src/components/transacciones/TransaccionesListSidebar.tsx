
import React from 'react';
import { useTransacciones } from '@/hooks/useTransacciones';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Euro, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const TransaccionesListSidebar = () => {
  const { transacciones, loading } = useTransacciones();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Sin valor';
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
      'Lead': 'bg-blue-100 text-blue-600',
      'In Progress': 'bg-yellow-100 text-yellow-600',
      'Won': 'bg-green-100 text-green-600',
      'Lost': 'bg-red-100 text-red-600'
    };
    return colors[stage || ''] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!transacciones || transacciones.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No hay transacciones</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-2">
        {transacciones.map((transaccion) => {
          const isSelected = transaccion.id === id;
          
          return (
            <div
              key={transaccion.id}
              onClick={() => navigate(`/transacciones/${transaccion.id}`)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm
                ${isSelected 
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/20' 
                  : 'bg-background border-border hover:bg-muted/50'
                }
              `}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm text-foreground truncate pr-2">
                    {transaccion.nombre_transaccion}
                  </h4>
                  <Badge 
                    className={`text-xs ${getStageColor(transaccion.stage?.name)}`}
                  >
                    {transaccion.stage?.name || 'Sin etapa'}
                  </Badge>
                </div>

                {transaccion.valor_transaccion && (
                  <div className="flex items-center gap-1 text-sm">
                    <Euro className="h-3 w-3 text-green-600" />
                    <span className="font-semibold text-green-600 text-xs">
                      {formatCurrency(transaccion.valor_transaccion)}
                    </span>
                  </div>
                )}

                {transaccion.company?.name && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{transaccion.company.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(transaccion.updated_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
