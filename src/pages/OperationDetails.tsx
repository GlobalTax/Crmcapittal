
import { useParams, useNavigate } from "react-router-dom";
import { useOperations } from "@/hooks/useOperations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { getStatusColor, getStatusLabel, formatFinancialValue } from "@/utils/operationHelpers";

const OperationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { operations } = useOperations();
  
  const operation = operations.find(op => op.id === id);

  if (!operation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Operación no encontrada</h2>
          <p className="text-muted-foreground mb-4">La operación que buscas no existe.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{operation.company_name}</h1>
          <p className="text-muted-foreground">{operation.sector}</p>
        </div>
        <Badge className={getStatusColor(operation.status)}>
          {getStatusLabel(operation.status)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Información Financiera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Monto</div>
              <div className="text-2xl font-bold">
                {operation.currency} {formatFinancialValue(operation.amount)}
              </div>
            </div>
            {operation.revenue && (
              <div>
                <div className="text-sm text-muted-foreground">Ingresos Anuales</div>
                <div className="text-lg font-semibold">
                  {operation.currency} {formatFinancialValue(operation.revenue)}
                </div>
              </div>
            )}
            {operation.annual_growth_rate && (
              <div>
                <div className="text-sm text-muted-foreground">Tasa de Crecimiento</div>
                <div className="text-lg font-semibold">{operation.annual_growth_rate}%</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Detalles Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Ubicación</div>
              <div className="font-medium">{operation.location}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tipo de Operación</div>
              <div className="font-medium">{operation.operation_type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fecha de Creación</div>
              <div className="font-medium">
                {new Date(operation.created_at).toLocaleDateString('es-ES')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {operation.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{operation.description}</p>
          </CardContent>
        </Card>
      )}

      {operation.manager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manager Asignado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <div className="font-medium">{operation.manager.name}</div>
                <div className="text-sm text-muted-foreground">{operation.manager.position}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OperationDetails;
