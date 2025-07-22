import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Edit, Pause, X, User } from 'lucide-react';
import { useReconversionHistory } from '@/hooks/useReconversionHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReconversionTimelineProps {
  reconversionId: string;
}

const actionIcons = {
  created: Plus,
  status_change: Edit,
  candidate_added: Plus,
  candidate_contact_updated: Edit,
  paused: Pause,
  closed: X,
};

const actionColors = {
  created: 'bg-green-500',
  status_change: 'bg-blue-500',
  candidate_added: 'bg-purple-500',
  candidate_contact_updated: 'bg-orange-500',
  paused: 'bg-yellow-500',
  closed: 'bg-red-500',
};

export function ReconversionTimeline({ reconversionId }: ReconversionTimelineProps) {
  const { history, loading, error } = useReconversionHistory(reconversionId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error al cargar el historial</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline de Actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay actividad registrada
            </p>
          ) : (
            history.map((item, index) => {
              const Icon = actionIcons[item.action_type as keyof typeof actionIcons] || Edit;
              const colorClass = actionColors[item.action_type as keyof typeof actionColors] || 'bg-gray-500';
              
              return (
                <div key={item.id} className="relative">
                  {index < history.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-16 bg-border" />
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.action_title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </Badge>
                      </div>
                      {item.action_description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.action_description}
                        </p>
                      )}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {item.metadata.reason && (
                            <p><strong>Motivo:</strong> {item.metadata.reason}</p>
                          )}
                          {item.metadata.outcome && (
                            <p><strong>Resultado:</strong> {item.metadata.outcome}</p>
                          )}
                          {item.metadata.match_score && (
                            <p><strong>Puntuación:</strong> {item.metadata.match_score}</p>
                          )}
                          {item.metadata.contact_method && (
                            <p><strong>Método:</strong> {item.metadata.contact_method}</p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <User className="h-3 w-3" />
                        <span>Sistema</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}