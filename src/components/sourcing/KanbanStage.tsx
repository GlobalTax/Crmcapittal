
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Negocio } from '@/types/Negocio';

interface KanbanStageProps {
  title: string;
  negocios: Negocio[];
  onNegocioClick?: (negocio: Negocio) => void;
}

export const KanbanStage: React.FC<KanbanStageProps> = ({ title, negocios, onNegocioClick }) => {
  return (
    <div className="min-w-80 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <Badge variant="secondary">{negocios.length}</Badge>
      </div>
      <div className="space-y-3">
        {negocios.map((negocio) => (
          <Card 
            key={negocio.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNegocioClick?.(negocio)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium truncate">
                {negocio.nombre_negocio}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-green-600">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                    .format(negocio.valor_negocio || 0)}
                </div>
                {negocio.company && (
                  <p className="text-xs text-gray-500 truncate">{negocio.company.name}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
