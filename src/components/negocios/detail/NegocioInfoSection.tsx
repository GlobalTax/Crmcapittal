
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Euro, User, FileText } from "lucide-react";
import { Negocio } from "@/types/Negocio";

interface NegocioInfoSectionProps {
  negocio: Negocio;
}

export const NegocioInfoSection = ({ negocio }: NegocioInfoSectionProps) => {
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return "bg-gray-100 text-gray-800";
      case 'media': return "bg-yellow-100 text-yellow-800";
      case 'alta': return "bg-orange-100 text-orange-800";
      case 'urgente': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Información del Negocio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Valor del Negocio</label>
            <div className="flex items-center mt-1">
              <Euro className="h-4 w-4 mr-1 text-gray-400" />
              <span className="text-lg font-semibold">{formatCurrency(negocio.valor_negocio)}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Prioridad</label>
            <div className="mt-1">
              <Badge className={getPriorityColor(negocio.prioridad)} variant="outline">
                {negocio.prioridad}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Etapa Actual</label>
            <div className="mt-1">
              {negocio.stage ? (
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: negocio.stage.color + '20', 
                    borderColor: negocio.stage.color,
                    color: negocio.stage.color 
                  }}
                >
                  {negocio.stage.name}
                </Badge>
              ) : (
                <span className="text-gray-500">Sin etapa</span>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Propietario</label>
            <div className="flex items-center mt-1">
              <User className="h-4 w-4 mr-1 text-gray-400" />
              <span>{negocio.propietario_negocio || 'Sin asignar'}</span>
            </div>
          </div>
        </div>

        {negocio.descripcion && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Descripción</label>
              <p className="mt-1 text-gray-700">{negocio.descripcion}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
