
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, Briefcase } from "lucide-react";

interface OperationCardContentProps {
  operation: Operation;
}

export const OperationCardContent = ({ operation }: OperationCardContentProps) => {
  console.log('OperationCardContent - operation.manager:', operation.manager);
  
  return (
    <div className="space-y-3">
      {/* Foto de la empresa si está disponible */}
      {operation.photo_url && (
        <div className="w-full">
          <img 
            src={operation.photo_url} 
            alt={`Foto de ${operation.company_name}`}
            className="w-full h-32 object-cover rounded-lg border border-border"
          />
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

      {(operation.buyer || operation.seller) && (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2 border-t border-border">
          {operation.buyer && (
            <span><strong className="text-foreground">Comprador:</strong> {operation.buyer}</span>
          )}
          {operation.seller && (
            <span><strong className="text-foreground">Vendedor:</strong> {operation.seller}</span>
          )}
        </div>
      )}

      {/* Información del Gestor mejorada */}
      {operation.manager && (
        <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage 
                src={operation.manager.photo} 
                alt={operation.manager.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {operation.manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-2">
                <User className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-foreground">Gestor Asignado</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {operation.manager.name}
                </div>
                
                {operation.manager.position && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{operation.manager.position}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{operation.manager.email}</span>
                </div>
                
                {operation.manager.phone && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{operation.manager.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de contacto alternativa si no hay gestor */}
      {!operation.manager && (operation.contact_email || operation.contact_phone) && (
        <div className="bg-muted/30 border border-border rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Información de Contacto</span>
          </div>
          <div className="space-y-1">
            {operation.contact_email && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{operation.contact_email}</span>
              </div>
            )}
            {operation.contact_phone && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{operation.contact_phone}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
