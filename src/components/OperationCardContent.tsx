
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";

interface OperationCardContentProps {
  operation: Operation;
}

export const OperationCardContent = ({ operation }: OperationCardContentProps) => {
  console.log('OperationCardContent - operation.manager:', operation.manager);
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-1 text-xs">
        <span className="font-medium text-black">Fecha</span>
        <span className="text-black">
          {new Date(operation.date).toLocaleDateString('es-ES')}
        </span>
      </div>

      {/* Métricas Financieras */}
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

      {/* Información del Gestor */}
      {operation.manager && (
        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-blue-800">👤 Gestor Asignado</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs text-blue-700">
                <span className="font-medium">Nombre:</span>
                <span>{operation.manager.name}</span>
              </div>
              {operation.manager.position && (
                <div className="flex items-center space-x-1 text-xs text-blue-700">
                  <span className="font-medium">Cargo:</span>
                  <span>{operation.manager.position}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-xs text-blue-700">
                <span className="font-medium">Email:</span>
                <span>{operation.manager.email}</span>
              </div>
              {operation.manager.phone && (
                <div className="flex items-center space-x-1 text-xs text-blue-700">
                  <span className="font-medium">Teléfono:</span>
                  <span>{operation.manager.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información de contacto alternativa si no hay gestor */}
      {!operation.manager && (operation.contact_email || operation.contact_phone) && (
        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-800">📞 Información de Contacto</span>
            </div>
            <div className="space-y-1">
              {operation.contact_email && (
                <div className="flex items-center space-x-1 text-xs text-gray-700">
                  <span className="font-medium">Email:</span>
                  <span>{operation.contact_email}</span>
                </div>
              )}
              {operation.contact_phone && (
                <div className="flex items-center space-x-1 text-xs text-gray-700">
                  <span className="font-medium">Teléfono:</span>
                  <span>{operation.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
