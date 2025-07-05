import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Transaccion } from '@/types/Transaccion';

interface TransaccionHeaderProps {
  transaccion: Transaccion;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const TransaccionHeader = ({ 
  transaccion, 
  onPrevious, 
  onNext, 
  hasPrevious, 
  hasNext 
}: TransaccionHeaderProps) => {
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

  return (
    <div className="bg-background border-b border-border">
      <div className="px-6 py-4">
        {/* Top Row - Back button and navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/transacciones"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver a Transacciones</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Transacción anterior</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Siguiente transacción</span>
            </Button>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {transaccion.nombre_transaccion}
              </h1>
              <Badge className={`text-xs ${getStageColor(transaccion.stage?.name)}`}>
                {transaccion.stage?.name || 'Sin etapa'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">Valor:</strong> {formatCurrency(transaccion.valor_transaccion)}
              </span>
              {transaccion.company && (
                <span>
                  <strong className="text-foreground">Empresa:</strong> {transaccion.company.name}
                </span>
              )}
              {transaccion.contact && (
                <span>
                  <strong className="text-foreground">Contacto:</strong> {transaccion.contact.name}
                </span>
              )}
              <span>
                <strong className="text-foreground">Tipo:</strong> {transaccion.tipo_transaccion}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};