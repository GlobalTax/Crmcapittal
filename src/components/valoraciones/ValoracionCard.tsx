import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Archive, Building, User, Calendar, Euro } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import type { Valoracion } from '@/types/Valoracion';

interface ValoracionCardProps {
  valoracion: Valoracion;
  onView?: (valoracion: Valoracion) => void;
  onEdit?: (valoracion: Valoracion) => void;
  onArchive?: (valoracion: Valoracion) => void;
}

export const ValoracionCard = React.memo(({
  valoracion,
  onView,
  onEdit,
  onArchive
}: ValoracionCardProps) => {
  const phase = VALORACION_PHASES[valoracion.status];
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return `€${amount.toLocaleString('es-ES')}`;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                <Building className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base truncate" title={valoracion.company_name}>
                {valoracion.company_name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate">{valoracion.client_name}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(valoracion)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(valoracion)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(valoracion)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archivar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estado y prioridad */}
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 font-medium"
            style={{ 
              backgroundColor: phase?.bgColor, 
              color: phase?.textColor,
              border: `1px solid ${phase?.color}`
            }}
          >
            {phase?.icon} {phase?.label}
          </Badge>
          
          {valoracion.priority && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(valoracion.priority)}`} />
              <span className="text-xs text-muted-foreground capitalize">
                {valoracion.priority}
              </span>
            </div>
          )}
        </div>

        {/* Sector */}
        {valoracion.company_sector && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Sector:</span> {valoracion.company_sector}
          </div>
        )}

        {/* Información financiera */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {valoracion.fee_quoted && (
            <div className="flex items-center gap-1">
              <Euro className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Cotizado:</span>
              <span className="font-medium">{formatCurrency(valoracion.fee_quoted)}</span>
            </div>
          )}
          
          {valoracion.valoracion_ev && (
            <div className="flex items-center gap-1">
              <Euro className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">EV:</span>
              <span className="font-medium text-green-600">{formatCurrency(valoracion.valoracion_ev)}</span>
            </div>
          )}
        </div>

        {/* Estado de pago */}
        {valoracion.payment_status && (
          <Badge 
            variant="outline" 
            className={`text-xs ${getPaymentStatusColor(valoracion.payment_status)}`}
          >
            {valoracion.payment_status === 'paid' && 'Pagado'}
            {valoracion.payment_status === 'pending' && 'Pendiente'}
            {valoracion.payment_status === 'partial' && 'Parcial'}
            {valoracion.payment_status === 'overdue' && 'Vencido'}
          </Badge>
        )}

        {/* Fecha de creación */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            Creado {formatDistanceToNow(new Date(valoracion.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

ValoracionCard.displayName = 'ValoracionCard';