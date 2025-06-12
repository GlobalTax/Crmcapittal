
import { Building, Calendar, MapPin, DollarSign, Users, TrendingUp, Mail, Phone, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Operation } from "@/types/Operation";

interface OperationsListProps {
  operations: Operation[];
  loading?: boolean;
  error?: string | null;
}

export const OperationsList = ({ operations, loading, error }: OperationsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "in_process":
        return "bg-orange-100 text-orange-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "withdrawn":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "in_process":
        return "En Proceso";
      case "sold":
        return "Vendida";
      case "withdrawn":
        return "Retirada";
      default:
        return status;
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-slate-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Cargando operaciones...</h3>
          <p className="text-slate-600">Por favor espera mientras cargamos las operaciones disponibles.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12">
        <div className="text-center">
          <Building className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar operaciones</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center">
          <Building className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No hay operaciones disponibles</h3>
          <p className="text-slate-600">Actualmente no hay operaciones disponibles en nuestra cartera.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Operaciones Disponibles</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {operations.map((operation) => (
          <Card key={operation.id} className="hover:shadow-lg transition-all duration-200 border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    {getOperationTypeIcon(operation.operation_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{operation.company_name}</h3>
                    <p className="text-slate-600 text-sm">{operation.sector}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(operation.status)}>
                  {getStatusLabel(operation.status)}
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
                  {getOperationTypeLabel(operation.operation_type)}
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

              {(operation.contact_email || operation.contact_phone) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {operation.contact_email && (
                    <div className="flex items-center space-x-1 text-xs text-slate-600">
                      <Mail className="h-3 w-3" />
                      <span>{operation.contact_email}</span>
                    </div>
                  )}
                  {operation.contact_phone && (
                    <div className="flex items-center space-x-1 text-xs text-slate-600">
                      <Phone className="h-3 w-3" />
                      <span>{operation.contact_phone}</span>
                    </div>
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
