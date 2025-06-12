
import { Building, Calendar, MapPin, DollarSign, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Operation } from "@/pages/Index";

interface OperationsListProps {
  operations: Operation[];
}

export const OperationsList = ({ operations }: OperationsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case "acquisition":
        return "Adquisición";
      case "merger":
        return "Fusión";
      case "sale":
        return "Venta";
      case "ipo":
        return "OPV";
      default:
        return type;
    }
  };

  const getOperationTypeIcon = (type: string) => {
    switch (type) {
      case "acquisition":
        return <Building className="h-4 w-4" />;
      case "merger":
        return <Users className="h-4 w-4" />;
      case "sale":
        return <DollarSign className="h-4 w-4" />;
      case "ipo":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  if (operations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center">
          <Building className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No hay operaciones</h3>
          <p className="text-slate-600">Comienza añadiendo tu primera operación de M&A.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Operaciones Recientes</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {operations.map((operation) => (
          <Card key={operation.id} className="hover:shadow-lg transition-all duration-200 border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    {getOperationTypeIcon(operation.operationType)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{operation.companyName}</h3>
                    <p className="text-slate-600 text-sm">{operation.sector}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(operation.status)}>
                  {operation.status === "completed" ? "Completada" : 
                   operation.status === "pending" ? "Pendiente" : "Cancelada"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-900">
                    {operation.currency} {(operation.amount / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">
                    {new Date(operation.date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">{operation.location}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {getOperationTypeLabel(operation.operationType)}
                </p>
                <p className="text-sm text-slate-600">{operation.description}</p>
              </div>

              {(operation.buyer || operation.seller) && (
                <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {operation.buyer && (
                    <span><strong>Comprador:</strong> {operation.buyer}</span>
                  )}
                  {operation.seller && (
                    <span><strong>Vendedor:</strong> {operation.seller}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
