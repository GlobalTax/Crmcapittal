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
      'Lead': 'bg-gray-100 text-gray-600',
      'In Progress': 'bg-orange-100 text-orange-600',
      'Won': 'bg-green-100 text-green-600',
      'Lost': 'bg-red-100 text-red-600'
    };
    return colors[stage || ''] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="px-6 py-4">
        {/* Top Row - Back button and navigation */}
        <div className="flex items-center justify-between mb-3">
          <Link 
            to="/transacciones"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Volver a Transacciones</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Transacción anterior</span>
            </Button>
            <Button
              variant="ghost"
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
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                {transaccion.nombre_transaccion}
              </h1>
              <Badge className={`text-xs ${getStageColor(transaccion.stage?.name)}`}>
                {transaccion.stage?.name || 'Sin etapa'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 leading-relaxed">
              <span>
                <strong className="text-gray-900">Valor:</strong> {formatCurrency(transaccion.valor_transaccion)}
              </span>
              {transaccion.company && (
                <span>
                  <strong className="text-gray-900">Empresa:</strong> {transaccion.company.name}
                </span>
              )}
              {transaccion.contact && (
                <span>
                  <strong className="text-gray-900">Contacto:</strong> {transaccion.contact.name}
                </span>
              )}
              <span>
                <strong className="text-gray-900">Tipo:</strong> {transaccion.tipo_transaccion}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};