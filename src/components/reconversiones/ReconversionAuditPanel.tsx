
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Info, Shield, Trash2 } from 'lucide-react';
import { useReconversionAuditLogs } from '@/hooks/useReconversionAuditLogs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReconversionAuditPanelProps {
  reconversionId: string;
}

export function ReconversionAuditPanel({ reconversionId }: ReconversionAuditPanelProps) {
  const { logs, loading, canViewLogs } = useReconversionAuditLogs(reconversionId);

  if (!canViewLogs) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Solo los administradores pueden ver los logs de auditoría</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoría</CardTitle>
          <CardDescription>Historial de acciones y cambios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('delete')) {
      return <Trash2 className="h-4 w-4 text-red-500" />;
    }
    return getSeverityIcon('info');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Log de Auditoría
        </CardTitle>
        <CardDescription>
          Historial completo de acciones y cambios ({logs.length} entradas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2" />
              <p>No hay entradas de auditoría</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{log.action_description}</p>
                        <Badge variant={getSeverityVariant(log.severity)} className="text-xs">
                          {log.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          {format(new Date(log.created_at), 'PPpp', { locale: es })}
                        </p>
                        {log.user_email && (
                          <p>Usuario: {log.user_email}</p>
                        )}
                        {log.ip_address && (
                          <p>IP: {log.ip_address}</p>
                        )}
                      </div>
                      {(log.old_data || log.new_data) && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                            Ver datos del cambio
                          </summary>
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            {log.old_data && (
                              <div className="mb-2">
                                <p className="font-medium">Datos anteriores:</p>
                                <pre className="whitespace-pre-wrap overflow-x-auto">
                                  {JSON.stringify(log.old_data, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_data && (
                              <div>
                                <p className="font-medium">Datos nuevos:</p>
                                <pre className="whitespace-pre-wrap overflow-x-auto">
                                  {JSON.stringify(log.new_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                  {index < logs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
