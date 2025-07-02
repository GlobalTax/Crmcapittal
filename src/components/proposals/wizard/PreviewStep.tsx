
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { CreateProposalData } from '@/types/Proposal';

interface PreviewStepProps {
  data: CreateProposalData;
  onEdit: (stepIndex: number) => void;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({ data, onEdit }) => {
  const totalAmount = data.total_amount || 0;
  const servicesCount = data.services?.length || 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Vista Previa de la Propuesta</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumen Ejecutivo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-2xl text-blue-600">{servicesCount}</h3>
              <p className="text-sm text-blue-800">Servicios</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-2xl text-green-600">€{totalAmount.toLocaleString()}</h3>
              <p className="text-sm text-green-800">Valor Total</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h3 className="font-bold text-2xl text-purple-600">{data.fee_structure?.type || 'N/A'}</h3>
              <p className="text-sm text-purple-800">Tipo de Honorarios</p>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Información del Cliente</h4>
              <p className="text-sm text-gray-600">{data.title}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(0)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>

          {/* Servicios */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Servicios Incluidos</h4>
              <p className="text-sm text-gray-600">{servicesCount} servicios por €{totalAmount.toLocaleString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(1)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>

          {/* Estructura de Honorarios */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Estructura de Honorarios</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">{data.fee_structure?.type}</Badge>
                <span className="text-sm text-gray-600">€{totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(2)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">¡Propuesta Lista!</h4>
            <p className="text-sm text-green-700">
              Tu propuesta profesional está completa y lista para ser enviada al cliente.
              Revisa todos los detalles antes del envío final.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
