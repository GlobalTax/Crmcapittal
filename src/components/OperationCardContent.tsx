
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";

interface OperationCardContentProps {
  operation: Operation;
}

export const OperationCardContent = ({ operation }: OperationCardContentProps) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-1 text-xs">
        <span className="font-medium text-black">Fecha</span>
        <span className="text-black">
          {new Date(operation.date).toLocaleDateString('es-ES')}
        </span>
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

      {/* Manager Information */}
      {operation.manager && (
        <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1 text-xs text-black">
            <span className="font-medium">Gestor:</span>
            <span>{operation.manager.name}</span>
          </div>
          {operation.manager.position && (
            <div className="flex items-center space-x-1 text-xs text-black">
              <span className="font-medium">Cargo:</span>
              <span>{operation.manager.position}</span>
            </div>
          )}
          <div className="flex items-center space-x-1 text-xs text-black">
            <span>Email: {operation.manager.email}</span>
          </div>
          {operation.manager.phone && (
            <div className="flex items-center space-x-1 text-xs text-black">
              <span>Tel: {operation.manager.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
