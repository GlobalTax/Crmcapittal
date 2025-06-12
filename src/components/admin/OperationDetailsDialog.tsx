
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Operation } from "@/types/Operation";
import { getStatusLabel, getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";
import { User, Mail, Phone, Briefcase, MapPin, Calendar, Building } from "lucide-react";

interface OperationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
}

export const OperationDetailsDialog = ({ 
  open, 
  onOpenChange, 
  operation 
}: OperationDetailsDialogProps) => {
  if (!operation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detalles de la Operación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with company name and status */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{operation.company_name}</h2>
              <p className="text-gray-600">{operation.sector}</p>
            </div>
            <Badge className="text-sm">
              {getStatusLabel(operation.status)}
            </Badge>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Tipo de Operación:</span>
              </div>
              <p className="text-gray-700 ml-6">
                {getOperationTypeLabel(operation.operation_type)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Fecha:</span>
              </div>
              <p className="text-gray-700 ml-6">
                {new Date(operation.date).toLocaleDateString('es-ES')}
              </p>
            </div>

            {operation.location && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Ubicación:</span>
                </div>
                <p className="text-gray-700 ml-6">{operation.location}</p>
              </div>
            )}

            {operation.cif && (
              <div className="space-y-2">
                <span className="font-medium">CIF:</span>
                <p className="text-gray-700">{operation.cif}</p>
              </div>
            )}
          </div>

          {/* Financial Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Información Financiera</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium text-sm">Facturación:</span>
                <p className="text-lg font-bold text-blue-600">
                  {formatFinancialValue(operation.revenue)}
                </p>
              </div>
              <div>
                <span className="font-medium text-sm">EBITDA:</span>
                <p className="text-lg font-bold text-green-600">
                  {formatFinancialValue(operation.ebitda)}
                </p>
              </div>
              {operation.annual_growth_rate && (
                <div>
                  <span className="font-medium text-sm">Crecimiento Anual:</span>
                  <p className="text-lg font-bold text-purple-600">
                    {operation.annual_growth_rate}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {operation.description && (
            <div className="space-y-2">
              <span className="font-medium">Descripción:</span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {operation.description}
              </p>
            </div>
          )}

          {/* Buyer/Seller Information */}
          {(operation.buyer || operation.seller) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operation.buyer && (
                <div className="space-y-2">
                  <span className="font-medium">Comprador:</span>
                  <p className="text-gray-700">{operation.buyer}</p>
                </div>
              )}
              {operation.seller && (
                <div className="space-y-2">
                  <span className="font-medium">Vendedor:</span>
                  <p className="text-gray-700">{operation.seller}</p>
                </div>
              )}
            </div>
          )}

          {/* Manager Information */}
          {operation.manager && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Gestor Asignado
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{operation.manager.name}</p>
                {operation.manager.position && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Briefcase className="h-3 w-3" />
                    <span>{operation.manager.position}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span>{operation.manager.email}</span>
                </div>
                {operation.manager.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{operation.manager.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(operation.contact_email || operation.contact_phone) && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Información de Contacto</h3>
              <div className="space-y-2">
                {operation.contact_email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-3 w-3" />
                    <span>{operation.contact_email}</span>
                  </div>
                )}
                {operation.contact_phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-3 w-3" />
                    <span>{operation.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
