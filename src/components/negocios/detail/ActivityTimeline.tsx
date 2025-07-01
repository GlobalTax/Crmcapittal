
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Negocio } from "@/types/Negocio";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityTimelineProps {
  negocio: Negocio;
}

export const ActivityTimeline = ({ negocio }: ActivityTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Negocio creado</p>
              <p className="text-xs text-gray-500">
                {format(new Date(negocio.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Última actualización</p>
              <p className="text-xs text-gray-500">
                {format(new Date(negocio.updated_at), 'dd MMM yyyy, HH:mm', { locale: es })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
