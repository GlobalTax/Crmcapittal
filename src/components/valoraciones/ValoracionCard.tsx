
import React from 'react';
import { Valoracion } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2, User, Calendar, MoreVertical, Eye, Edit, Archive } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SecureButton } from './SecureButton';
import { useValoracionPermissions } from '@/hooks/useValoracionPermissions';

interface ValoracionCardProps {
  valoracion: Valoracion;
  onView?: (valoracion: Valoracion) => void;
  onEdit?: (valoracion: Valoracion) => void;
  onArchive?: (valoracion: Valoracion) => void;
}

export const ValoracionCard = ({ 
  valoracion, 
  onView, 
  onEdit, 
  onArchive
}: ValoracionCardProps) => {
  const phase = VALORACION_PHASES[valoracion.status];
  const permissions = useValoracionPermissions(valoracion);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityBadge = () => {
    if (!valoracion.priority) return null;
    
    const priorityConfig = {
      urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800', icon: '🔴' },
      high: { label: 'Alta', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
      medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      low: { label: 'Baja', color: 'bg-green-100 text-green-800', icon: '🟢' }
    };
    
    const config = priorityConfig[valoracion.priority];
    return (
      <Badge className={`${config.color} text-xs border-0`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  if (!permissions.canView) {
    return (
      <Card className="opacity-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-muted-foreground">
            <p>Sin permisos para ver esta valoración</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => permissions.canView && onView?.(valoracion)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {valoracion.company_name}
                </h3>
                {getPriorityBadge()}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{valoracion.client_name}</span>
                </div>
                {valoracion.company_sector && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{valoracion.company_sector}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`${phase.bgColor} ${phase.textColor} border-0`}>
                    {phase.icon} {phase.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{phase.description}</p>
                </TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SecureButton 
                    hasPermission={permissions.canView}
                    variant="ghost" 
                    size="sm" 
                    className="w-8 h-8 p-0"
                    showLockIcon={false}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </SecureButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(valoracion); }}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                  {permissions.canEdit && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(valoracion); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {permissions.canArchive && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive?.(valoracion); }}>
                      <Archive className="w-4 h-4 mr-2" />
                      Archivar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {valoracion.assigned_to ? getInitials(valoracion.assigned_to) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-sm ${valoracion.assigned_to ? 'text-muted-foreground' : 'text-orange-600 font-medium'}`}>
                  {valoracion.assigned_to || 'Sin asignar'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(valoracion.created_at), 'dd MMM', { locale: es })}</span>
            </div>
          </div>
          
          {/* Valor estimado */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor Estimado:</span>
            <span className="text-lg font-bold text-primary">
              {valoracion.valoracion_ev 
                ? `€${valoracion.valoracion_ev.toLocaleString('es-ES')}`
                : <span className="text-muted-foreground text-sm font-normal">Pendiente</span>
              }
            </span>
          </div>
          
          {valoracion.company_description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {valoracion.company_description}
            </p>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
