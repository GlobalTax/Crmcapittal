import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const formatFinancialValue = (value?: number) => {
    if (!value) return 'N/A';
    return `€${(value / 1000000).toFixed(1)}M`;
  };

  const handleRequestInfo = (operation: Operation) => {
    const subject = `Solicitud de información - ${operation.company_name}`;
    const body = `Hola,\n\nEstoy interesado en obtener más información sobre la operación de ${operation.company_name} (${getOperationTypeLabel(operation.operation_type)}) en el sector ${operation.sector}.\n\nGracias.`;
    
    if (operation.contact_email) {
      window.location.href = `mailto:${operation.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      // Si no hay email de contacto, mostrar información
      alert(`Para más información sobre ${operation.company_name}, contacte por teléfono: ${operation.contact_phone || 'Información de contacto no disponible'}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-black p-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-black mb-2">Cargando operaciones...</h3>
          <p className="text-black">Por favor espera mientras cargamos las operaciones disponibles.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-black p-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-black mb-2">Error al cargar operaciones</h3>
          <p className="text-black">{error}</p>
        </div>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-black p-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-black mb-2">No hay operaciones disponibles</h3>
          <p className="text-black">Actualmente no hay operaciones disponibles en nuestra cartera.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-black">Operaciones Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operations.map((operation) => (
          <Card key={operation.id} className="hover:shadow-lg transition-all duration-200 border-black bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div>
                    <h3 className="font-semibold text-black text-base">{operation.company_name}</h3>
                    <p className="text-black text-xs">{operation.sector}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(operation.status)}>
                  {getStatusLabel(operation.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-1 text-xs">
                  <span className="font-medium text-black">Valoración</span>
                  <span className="text-black">
                    {operation.currency} {(operation.amount / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex flex-col space-y-1 text-xs">
                  <span className="font-medium text-black">Fecha</span>
                  <span className="text-black">
                    {new Date(operation.date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg">
                <div className="flex flex-col space-y-1 text-xs">
                  <span className="font-medium text-black">Facturación</span>
                  <span className="text-black">{formatFinancialValue(operation.revenue)}</span>
                </div>
                <div className="flex flex-col space-y-1 text-xs">
                  <span className="font-medium text-black">EBITDA</span>
                  <span className="text-black">{formatFinancialValue(operation.ebitda)}</span>
                </div>
                <div className="flex flex-col space-y-1 text-xs">
                  <span className="font-medium text-black">Crecimiento</span>
                  <span className="text-black">
                    {operation.annual_growth_rate ? `${operation.annual_growth_rate}%` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-black">{operation.location}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-xs font-medium text-black mb-1">
                  {getOperationTypeLabel(operation.operation_type)}
                </p>
                <p className="text-xs text-black line-clamp-2">{operation.description}</p>
              </div>

              {(operation.buyer || operation.seller) && (
                <div className="flex flex-col gap-1 text-xs text-black pt-2 border-t border-slate-100">
                  {operation.buyer && (
                    <span><strong>Comprador:</strong> {operation.buyer}</span>
                  )}
                  {operation.seller && (
                    <span><strong>Vendedor:</strong> {operation.seller}</span>
                  )}
                </div>
              )}

              {(operation.contact_email || operation.contact_phone) && (
                <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                  {operation.contact_email && (
                    <div className="flex items-center space-x-1 text-xs text-black">
                      <span>Email: {operation.contact_email}</span>
                    </div>
                  )}
                  {operation.contact_phone && (
                    <div className="flex items-center space-x-1 text-xs text-black">
                      <span>Tel: {operation.contact_phone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100">
                <Button 
                  onClick={() => handleRequestInfo(operation)}
                  className="w-full"
                  variant="default"
                  size="sm"
                >
                  Solicitar información
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
