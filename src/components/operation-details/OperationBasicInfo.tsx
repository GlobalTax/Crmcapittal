
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin } from "lucide-react";
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel } from "@/utils/operationHelpers";

interface OperationBasicInfoProps {
  operation: Operation;
}

export const OperationBasicInfo = ({ operation }: OperationBasicInfoProps) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Empresa</label>
            <p className="text-sm font-semibold">{operation.company_name}</p>
          </div>
          {operation.project_name && (
            <div>
              <label className="text-sm font-medium text-gray-600">Proyecto</label>
              <p className="text-sm">{operation.project_name}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-600">Sector</label>
            <p className="text-sm">{operation.sector}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Tipo de Operación</label>
            <p className="text-sm">{getOperationTypeLabel(operation.operation_type)}</p>
          </div>
          {operation.cif && (
            <div>
              <label className="text-sm font-medium text-gray-600">CIF</label>
              <p className="text-sm">{operation.cif}</p>
            </div>
          )}
          {operation.location && (
            <div>
              <label className="text-sm font-medium text-gray-600">Ubicación</label>
              <p className="text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {operation.location}
              </p>
            </div>
          )}
        </div>
        
        {operation.description && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-600">Descripción</label>
              <p className="text-sm mt-2 leading-relaxed">{operation.description}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
