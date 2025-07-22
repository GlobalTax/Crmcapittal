import React from 'react';
import { Valoracion } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, User, Calendar, History, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SecureButton } from './SecureButton';
import { useValoracionPermissions } from '@/hooks/useValoracionPermissions';

interface ValoracionHeaderProps {
  valoracion: Valoracion;
  onShowHistory?: () => void;
  onEdit?: () => void;
}

export const ValoracionHeader = ({ 
  valoracion, 
  onShowHistory, 
  onEdit
}: ValoracionHeaderProps) => {
  const phase = VALORACION_PHASES[valoracion.status];
  const permissions = useValoracionPermissions(valoracion);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!permissions.canView) {
    return (
      <Card className="border-l-4 border-red-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <p>No tienes permisos para ver esta valoración</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4" style={{ borderLeftColor: phase.color }}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl text-foreground">
              {valoracion.company_name}
            </CardTitle>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Cliente: <span className="font-medium">{valoracion.client_name}</span></span>
              </div>
              {valoracion.company_sector && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{valoracion.company_sector}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={`${phase.bgColor} ${phase.textColor} border-0`}>
              {phase.icon} {phase.label}
            </Badge>
            <SecureButton 
              hasPermission={permissions.canEdit}
              disabledReason={permissions.disabledReason}
              variant="outline" 
              size="sm" 
              onClick={onEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </SecureButton>
            <SecureButton 
              hasPermission={permissions.canView}
              variant="outline" 
              size="sm" 
              onClick={onShowHistory}
              showLockIcon={false}
            >
              <History className="w-4 h-4 mr-1" />
              Historial
            </SecureButton>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Responsable</p>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {valoracion.assigned_to ? getInitials(valoracion.assigned_to) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {valoracion.assigned_to || 'Sin asignar'}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Fecha Solicitud</p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {format(new Date(valoracion.created_at), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>
          
          {valoracion.estimated_delivery && (
            <div>
              <p className="text-sm text-muted-foreground">Entrega Estimada</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {format(new Date(valoracion.estimated_delivery), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          )}
          
          {valoracion.priority && (
            <div>
              <p className="text-sm text-muted-foreground">Prioridad</p>
              <Badge 
                variant={valoracion.priority === 'urgent' ? 'destructive' : 'secondary'} 
                className="mt-1"
              >
                {valoracion.priority === 'urgent' && '🔴'}
                {valoracion.priority === 'high' && '🟠'}
                {valoracion.priority === 'medium' && '🟡'}
                {valoracion.priority === 'low' && '🟢'}
                {' '}
                {valoracion.priority === 'urgent' ? 'Urgente' : 
                 valoracion.priority === 'high' ? 'Alta' :
                 valoracion.priority === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            </div>
          )}
        </div>
        
        {valoracion.company_description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Descripción</p>
            <p className="text-sm">{valoracion.company_description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
