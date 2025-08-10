
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Download, User, Mail, Phone } from "lucide-react";

interface OperationCardContentProps {
  operation: Operation;
}

export const OperationCardContent = ({ operation }: OperationCardContentProps) => {
  console.log('OperationCardContent - Rendering manager info:', operation.manager);
  
  // Simulamos datos de analytics (en una implementación real vendrían de la base de datos)
  const views = Math.floor(Math.random() * 500) + 50;
  const downloads = Math.floor(Math.random() * 100) + 10;
  
  return (
    <div className="space-y-3">
      {/* Información del gestor - Movida al principio y mejorada */}
      {operation.manager && operation.manager.name && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-background shadow-md">
              <AvatarImage 
                src={operation.manager.photo} 
                alt={operation.manager.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {operation.manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gestor Asignado</span>
              </div>
              
              <div className="text-base font-bold text-foreground mb-1">
                {operation.manager.name}
              </div>
              
              {operation.manager.position && (
                <div className="text-sm text-muted-foreground font-medium">
                  {operation.manager.position}
                </div>
              )}
            </div>
          </div>

          {/* Información de contacto adicional */}
          <div className="flex flex-wrap gap-3 text-xs">
            {operation.manager.email && (
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{operation.manager.email}</span>
              </div>
            )}
            
            {operation.manager.phone && (
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{operation.manager.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
};
