
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff, MessageCircle, TrendingUp, User, Building, Target, MapPin } from 'lucide-react';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { SecureButton } from '@/components/valoraciones/SecureButton';
import { formatInvestmentRange } from '@/utils/reconversionPhases';
import { Reconversion } from '@/types/Reconversion';

interface EnhancedReconversionCardProps {
  reconversion: Reconversion;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onViewComments?: () => void;
  onStartMatching?: () => void;
}

export function EnhancedReconversionCard({ 
  reconversion, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onViewComments,
  onStartMatching
}: EnhancedReconversionCardProps) {
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {canViewSensitive ? reconversion.company_name : maskSensitiveData(reconversion.company_name)}
              </span>
              {!canViewSensitive && <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
              {isAdmin && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {canViewSensitive ? reconversion.contact_name : maskSensitiveData(reconversion.contact_name)}
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ReconversionStatusBadge 
              status={reconversion.status} 
              priority={reconversion.priority}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investment Range */}
        {(reconversion.investment_capacity_min || reconversion.investment_capacity_max) && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Capacidad:</span>
            <span className="font-medium">
              {formatInvestmentRange(reconversion.investment_capacity_min, reconversion.investment_capacity_max)}
            </span>
          </div>
        )}

        {/* Target Sectors */}
        {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-muted-foreground">Sectores:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {reconversion.target_sectors.slice(0, 3).map((sector, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {reconversion.target_sectors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{reconversion.target_sectors.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Geographic Preferences */}
        {reconversion.geographic_preferences && reconversion.geographic_preferences.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ubicación:</span>
            <span className="font-medium">
              {reconversion.geographic_preferences.slice(0, 2).join(', ')}
              {reconversion.geographic_preferences.length > 2 && '...'}
            </span>
          </div>
        )}

        {/* Assigned To */}
        {reconversion.assigned_to && (
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getInitials('Responsable')}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">Responsable asignado</span>
          </div>
        )}

        {/* Original Rejection Reason */}
        {reconversion.original_rejection_reason && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Motivo original:</p>
            <p className="text-foreground line-clamp-2">
              {canViewSensitive 
                ? reconversion.original_rejection_reason 
                : maskSensitiveData(reconversion.original_rejection_reason)
              }
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {onViewDetails && (
            <SecureButton
              hasPermission={canRead}
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              disabledReason="No tienes permisos para ver los detalles"
            >
              <Eye className="h-4 w-4 mr-1" />
              Detalles
            </SecureButton>
          )}

          {onStartMatching && reconversion.status === 'activa' && (
            <SecureButton
              hasPermission={canWrite}
              variant="default"
              size="sm"
              onClick={onStartMatching}
              disabledReason="No tienes permisos para iniciar matching"
            >
              <Target className="h-4 w-4 mr-1" />
              Matching
            </SecureButton>
          )}

          {onViewComments && (
            <SecureButton
              hasPermission={canRead}
              variant="ghost"
              size="sm"
              onClick={onViewComments}
              disabledReason="No tienes permisos para ver comentarios"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Comentarios
            </SecureButton>
          )}
          
          {onEdit && (
            <SecureButton
              hasPermission={canWrite}
              variant="ghost"
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
              variant="ghost"
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
