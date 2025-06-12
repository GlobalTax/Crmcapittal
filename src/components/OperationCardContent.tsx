
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface OperationCardContentProps {
  operation: Operation;
}

export const OperationCardContent = ({ operation }: OperationCardContentProps) => {
  console.log('OperationCardContent - operation.manager:', operation.manager);
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-1 text-xs">
        <span className="font-medium text-foreground">Fecha</span>
        <span className="text-muted-foreground">
          {new Date(operation.date).toLocaleDateString('es-ES')}
        </span>
      </div>

      {/* Métricas Financieras */}
      <div className="grid grid-cols-3 gap-2 bg-muted/50 p-2 rounded-lg">
        <div className="flex flex-col space-y-1 text-xs">
          <span className="font-medium text-foreground">Facturación</span>
          <span className="text-muted-foreground">{formatFinancialValue(operation.revenue)}</span>
        </div>
        <div className="flex flex-col space-y-1 text-xs">
          <span className="font-medium text-foreground">EBITDA</span>
          <span className="text-muted-foreground">{formatFinancialValue(operation.ebitda)}</span>
        </div>
        <div className="flex flex-col space-y-1 text-xs">
          <span className="font-medium text-foreground">Crecimiento</span>
          <span className="text-muted-foreground">
            {operation.annual_growth_rate ? `${operation.annual_growth_rate}%` : 'N/A'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs">
        <span className="text-muted-foreground">{operation.location}</span>
      </div>

      <div className="bg-muted/50 p-2 rounded-lg">
        <p className="text-xs font-medium text-foreground mb-1">
          {getOperationTypeLabel(operation.operation_type)}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">{operation.description}</p>
      </div>

      {/* Información del gestor */}
      {operation.manager && operation.manager.name && (
        <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage 
                src={operation.manager.photo} 
                alt={operation.manager.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {operation.manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <User className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-foreground">Gestor</span>
              </div>
              
              <div className="text-sm font-medium text-foreground truncate">
                {operation.manager.name}
              </div>
              
              {operation.manager.position && (
                <div className="text-xs text-muted-foreground truncate">
                  {operation.manager.position}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
