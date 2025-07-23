
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { SecureButton } from '@/components/valoraciones/SecureButton';

interface SecureReconversionCardProps {
  reconversion: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export function SecureReconversionCard({ 
  reconversion, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: SecureReconversionCardProps) {
  const { hasPermission, canViewSensitiveData, maskSensitiveData, isAdmin } = useReconversionSecurity();

  const canRead = hasPermission(reconversion, 'read');
  const canWrite = hasPermission(reconversion, 'write');
  const canDeleteRecord = hasPermission(reconversion, 'delete');
  const canViewSensitive = canViewSensitiveData(reconversion);

  if (!canRead) {
    return (
      <Card className="opacity-50 border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sin permisos de acceso</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completada':
        return 'default';
      case 'en_progreso':
        return 'secondary';
      case 'pausada':
        return 'outline';
      case 'cerrada':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {canViewSensitive ? reconversion.company_name : maskSensitiveData(reconversion.company_name || 'Sin nombre')}
              {!canViewSensitive && <EyeOff className="h-4 w-4 text-muted-foreground" />}
              {isAdmin && <Lock className="h-3 w-3 text-muted-foreground" />}
            </CardTitle>
            <CardDescription>
              Cliente: {canViewSensitive ? reconversion.contact_name : maskSensitiveData(reconversion.contact_name || 'Sin contacto')}
              {reconversion.target_sectors && reconversion.target_sectors.length > 0 && 
                ` • Sectores: ${reconversion.target_sectors.join(', ')}`
              }
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge variant={getStatusBadgeVariant(reconversion.status)}>
              {reconversion.status}
            </Badge>
            {reconversion.assigned_to && (
              <p className="text-xs text-muted-foreground mt-1">
                Asignado
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      {(reconversion.notes || reconversion.original_rejection_reason) && (
        <CardContent>
          {reconversion.notes && (
            <div className="mb-2">
              <p className="text-sm font-medium mb-1">Notas:</p>
              <p className="text-sm text-muted-foreground">
                {canViewSensitive ? reconversion.notes : maskSensitiveData(reconversion.notes)}
              </p>
            </div>
          )}
          {reconversion.original_rejection_reason && (
            <div>
              <p className="text-sm font-medium mb-1">Motivo original:</p>
              <p className="text-sm text-muted-foreground">
                {canViewSensitive ? reconversion.original_rejection_reason : maskSensitiveData(reconversion.original_rejection_reason)}
              </p>
            </div>
          )}
        </CardContent>
      )}

      <CardContent className="pt-0">
        <div className="flex gap-2 justify-end">
          {onViewDetails && (
            <SecureButton
              hasPermission={canRead}
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              disabledReason="No tienes permisos para ver los detalles"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver detalles
            </SecureButton>
          )}
          
          {onEdit && (
            <SecureButton
              hasPermission={canWrite}
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabledReason="No tienes permisos para editar esta reconversión"
            >
              Editar
            </SecureButton>
          )}
          
          {onDelete && (
            <SecureButton
              hasPermission={canDeleteRecord}
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabledReason="Solo los administradores pueden eliminar reconversiones"
            >
              Eliminar
            </SecureButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
