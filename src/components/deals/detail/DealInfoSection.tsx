
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Euro, User, FileText } from "lucide-react";
import { Deal } from "@/types/Deal";

interface DealInfoSectionProps {
  deal: Deal;
}

export const DealInfoSection = ({ deal }: DealInfoSectionProps) => {
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
            <label className="text-sm font-medium text-gray-500">Valor del Deal</label>
            <div className="flex items-center mt-1">
              <Euro className="h-4 w-4 mr-1 text-gray-400" />
              <span className="text-lg font-semibold">{formatCurrency(deal.deal_value)}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Prioridad</label>
            <div className="mt-1">
              <Badge className={getPriorityColor(deal.priority)} variant="outline">
                {deal.priority}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Etapa Actual</label>
            <div className="mt-1">
              {deal.stage ? (
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: deal.stage.color + '20', 
                    borderColor: deal.stage.color,
                    color: deal.stage.color 
                  }}
                >
                  {deal.stage.name}
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
              <span>{deal.deal_owner || 'Sin asignar'}</span>
            </div>
          </div>
        </div>

        {deal.description && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">Descripción</label>
              <p className="mt-1 text-gray-700">{deal.description}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
