import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Building, User, Mail, Phone, Target, MapPin, Euro } from 'lucide-react';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];

interface ReconversionListProps {
  reconversiones: Reconversion[];
  onView: (reconversion: Reconversion) => void;
  onEdit: (reconversion: Reconversion) => void;
  onDelete: (reconversion: Reconversion) => void;
  viewMode?: 'grid' | 'list';
}

export function ReconversionList({ 
  reconversiones, 
  onView, 
  onEdit, 
  onDelete, 
  viewMode = 'grid' 
}: ReconversionListProps) {
  const { hasPermission, canViewSensitiveData, maskSensitiveData } = useReconversionSecurity();

  const formatPriority = (priority: string) => {
    const priorityMap = {
      low: { label: 'Baja', variant: 'secondary' as const },
      medium: { label: 'Media', variant: 'default' as const },
      high: { label: 'Alta', variant: 'destructive' as const },
      urgent: { label: 'Urgente', variant: 'destructive' as const }
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const formatInvestmentRange = (min?: number, max?: number) => {
    if (!min && !max) return 'No especificado';
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `Desde €${min.toLocaleString()}`;
    if (max) return `Hasta €${max.toLocaleString()}`;
    return 'No especificado';
  };

  if (reconversiones.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay reconversiones</h3>
          <p className="text-muted-foreground">
            No se encontraron reconversiones que coincidan con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {reconversiones.map((reconversion) => {
          const canRead = hasPermission(reconversion, 'read');
          const canWrite = hasPermission(reconversion, 'write');
          const canDelete = hasPermission(reconversion, 'delete');
          const canViewSensitive = canViewSensitiveData(reconversion);
        const priority = formatPriority((reconversion as any).priority || 'medium');

          return (
            <Card key={reconversion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{reconversion.company_name}</h3>
                    <ReconversionStatusBadge status={reconversion.status as any} />
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {canViewSensitive ? reconversion.contact_name : maskSensitiveData(reconversion.contact_name || '')}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {canViewSensitive ? reconversion.contact_email : maskSensitiveData(reconversion.contact_email || '')}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        {formatInvestmentRange(reconversion.investment_capacity_min || undefined, reconversion.investment_capacity_max || undefined)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {reconversion.target_sectors?.length > 0 ? `${reconversion.target_sectors.length} sectores` : 'Sin sectores'}
                      </div>
                    </div>

                    {reconversion.rejection_reason && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Motivo:</strong> {reconversion.rejection_reason.substring(0, 100)}
                        {reconversion.rejection_reason.length > 100 && '...'}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Creado {formatDistanceToNow(new Date(reconversion.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {canRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(reconversion)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canWrite && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(reconversion)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(reconversion)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reconversiones.map((reconversion) => {
        const canRead = hasPermission(reconversion, 'read');
        const canWrite = hasPermission(reconversion, 'write');
        const canDelete = hasPermission(reconversion, 'delete');
        const canViewSensitive = canViewSensitiveData(reconversion);
        const priority = formatPriority((reconversion as any).priority || 'medium');

        return (
          <Card key={reconversion.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{reconversion.company_name}</CardTitle>
                  <CardDescription>
                    {canViewSensitive ? reconversion.contact_name : maskSensitiveData(reconversion.contact_name || '')}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <ReconversionStatusBadge status={reconversion.status as any} />
                  <Badge variant={priority.variant} className="text-xs">
                    {priority.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {canViewSensitive ? reconversion.contact_email : maskSensitiveData(reconversion.contact_email || '')}
                  </span>
                </div>

                {reconversion.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {canViewSensitive ? reconversion.contact_phone : maskSensitiveData(reconversion.contact_phone)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatInvestmentRange(reconversion.investment_capacity_min || undefined, reconversion.investment_capacity_max || undefined)}
                  </span>
                </div>

                {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {reconversion.target_sectors.length} sectores objetivo
                    </span>
                  </div>
                )}
              </div>

              {reconversion.rejection_reason && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Motivo:</strong> {reconversion.rejection_reason.substring(0, 80)}
                    {reconversion.rejection_reason.length > 80 && '...'}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reconversion.created_at), { addSuffix: true, locale: es })}
                </p>

                <div className="flex items-center gap-1">
                  {canRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(reconversion)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {canWrite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(reconversion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(reconversion)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}