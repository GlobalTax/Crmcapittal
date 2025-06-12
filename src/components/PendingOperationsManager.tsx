
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Operation } from "@/types/Operation";
import { getStatusColor, getStatusLabel, getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";
import { Check, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingOperationsManagerProps {
  operations: Operation[];
  onStatusUpdate: (operationId: string, newStatus: Operation['status']) => Promise<{ data: any; error: string | null }>;
}

export const PendingOperationsManager = ({ operations, onStatusUpdate }: PendingOperationsManagerProps) => {
  const { toast } = useToast();
  const pendingOperations = operations.filter(op => op.status === 'pending_review');

  const handleApprove = async (operationId: string) => {
    const { error } = await onStatusUpdate(operationId, 'approved');
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Operación Aprobada",
        description: "La operación ha sido aprobada exitosamente",
      });
    }
  };

  const handleReject = async (operationId: string) => {
    const { error } = await onStatusUpdate(operationId, 'rejected');
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Operación Rechazada",
        description: "La operación ha sido rechazada",
      });
    }
  };

  const handleMakeAvailable = async (operationId: string) => {
    const { error } = await onStatusUpdate(operationId, 'available');
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Operación Publicada",
        description: "La operación ahora está disponible en el portfolio",
      });
    }
  };

  if (pendingOperations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Solicitudes Pendientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay solicitudes pendientes de revisión
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Solicitudes Pendientes</span>
          </div>
          <Badge variant="secondary">{pendingOperations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingOperations.map((operation) => (
          <div key={operation.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-lg">{operation.company_name}</h4>
                <p className="text-sm text-muted-foreground">{operation.sector}</p>
                <Badge className={getStatusColor(operation.status)}>
                  {getStatusLabel(operation.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {operation.currency} {formatFinancialValue(operation.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getOperationTypeLabel(operation.operation_type)}
                </p>
              </div>
            </div>

            {operation.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {operation.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                Enviado: {new Date(operation.created_at).toLocaleDateString('es-ES')}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(operation.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApprove(operation.id)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleMakeAvailable(operation.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
