import React from 'react';
import { Transaccion } from '@/types/Transaccion';
import { EnhancedPipelineDots } from './EnhancedPipelineDots';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UltraHybridTransactionsTableProps {
  transacciones: Transaccion[];
  onStageChange: (transactionId: string, stageId: string) => void;
  onUpdate: (transactionId: string) => void;
}

export function UltraHybridTransactionsTable({ 
  transacciones, 
  onStageChange, 
  onUpdate 
}: UltraHybridTransactionsTableProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '€0';
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`;
    }
    return `€${amount}`;
  };

  const getValueColor = (amount: number | undefined) => {
    if (!amount) return 'text-muted-foreground';
    if (amount >= 1000000) return 'text-green-600 font-bold';
    if (amount >= 500000) return 'text-blue-600 font-semibold';
    return 'text-muted-foreground';
  };

  const getOwnerInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatNextAction = (transaccion: Transaccion) => {
    if (transaccion.proxima_actividad) {
      return `Próx: ${transaccion.proxima_actividad}`;
    }
    return 'Sin próxima acción';
  };

  return (
    <div className="bg-background rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 w-[30%] text-sm font-medium text-muted-foreground">
                Cliente
              </th>
              <th className="text-left p-3 w-[15%] text-sm font-medium text-muted-foreground">
                Valor
              </th>
              <th className="text-left p-3 w-[35%] text-sm font-medium text-muted-foreground">
                Pipeline
              </th>
              <th className="text-left p-3 w-[20%] text-sm font-medium text-muted-foreground">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((transaccion) => (
              <tr 
                key={transaccion.id} 
                className="border-b border-border hover:bg-muted/50 transition-colors h-12"
              >
                {/* CLIENTE (30%) */}
                <td className="p-3">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-foreground">
                      {transaccion.company?.name || 'Sin empresa'} • {transaccion.nombre_transaccion}
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getOwnerInitials(transaccion.propietario_transaccion)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {transaccion.propietario_transaccion || 'Sin propietario'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* VALOR (15%) */}
                <td className="p-3">
                  <div className={`text-sm ${getValueColor(transaccion.valor_transaccion)}`}>
                    {formatCurrency(transaccion.valor_transaccion)}
                  </div>
                </td>

                {/* PIPELINE (35%) */}
                <td className="p-3">
                  <EnhancedPipelineDots 
                    transaccion={transaccion} 
                    onStageChange={onStageChange}
                  />
                </td>

                {/* ACCIÓN (20%) */}
                <td className="p-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {formatNextAction(transaccion)}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onUpdate(transaccion.id)}
                      className="h-6 text-xs px-2"
                    >
                      Update
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transacciones.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay transacciones disponibles
        </div>
      )}
    </div>
  );
}