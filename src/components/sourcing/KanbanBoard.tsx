
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Negocio } from '@/types/Negocio';

interface KanbanBoardProps {
  negocios: Negocio[];
  onNegocioClick?: (negocio: Negocio) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ negocios, onNegocioClick }) => {
  const stageGroups = negocios.reduce((acc, negocio) => {
    const stageId = negocio.stage_id || 'sin-etapa';
    const stageName = negocio.stage?.name || 'Sin Etapa';
    
    if (!acc[stageId]) {
      acc[stageId] = {
        name: stageName,
        negocios: []
      };
    }
    acc[stageId].negocios.push(negocio);
    return acc;
  }, {} as Record<string, { name: string; negocios: Negocio[] }>);

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {Object.entries(stageGroups).map(([stageId, stage]) => (
        <div key={stageId} className="min-w-80 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{stage.name}</h3>
            <Badge variant="secondary">{stage.negocios.length}</Badge>
          </div>
          <div className="space-y-3">
            {stage.negocios.map((negocio) => (
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
      ))}
    </div>
  );
};
