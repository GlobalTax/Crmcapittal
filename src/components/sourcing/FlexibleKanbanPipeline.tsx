
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNegocios } from '@/hooks/useNegocios';

interface FlexibleKanbanPipelineProps {
  pipelineId: string;
}

export const FlexibleKanbanPipeline: React.FC<FlexibleKanbanPipelineProps> = ({ pipelineId }) => {
  const { negocios, loading } = useNegocios(pipelineId);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando pipeline...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {negocios.map((negocio) => (
          <Card key={negocio.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium truncate">
                {negocio.nombre_negocio}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-green-600">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
                    .format(negocio.valor_negocio || 0)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {negocio.stage?.name || 'Sin etapa'}
                </Badge>
                {negocio.company && (
                  <p className="text-sm text-gray-500 truncate">{negocio.company.name}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
