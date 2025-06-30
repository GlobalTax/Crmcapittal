
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Deal } from "@/types/Deal";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MetricsPanelProps {
  deal: Deal;
}

export const MetricsPanel = ({ deal }: MetricsPanelProps) => {
  const getDaysInPipeline = (createdAt: string) => {
    const days = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Métricas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Días en pipeline</span>
          <span className="text-sm font-medium">{getDaysInPipeline(deal.created_at)} días</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Fecha de creación</span>
          <span className="text-sm font-medium">
            {format(new Date(deal.created_at), 'dd/MM/yyyy', { locale: es })}
          </span>
        </div>
        {deal.close_date && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Fecha de cierre</span>
            <span className="text-sm font-medium">
              {format(new Date(deal.close_date), 'dd/MM/yyyy', { locale: es })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
