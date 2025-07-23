
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  MessageSquare, 
  FileText, 
  Clock, 
  Download,
  Filter,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useValoracionComments } from '@/hooks/useValoracionComments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface ValoracionActivityPanelProps {
  valoracionId: string;
}

interface ActivityEvent {
  id: string;
  type: 'comment' | 'document' | 'phase_change' | 'assignment';
  title: string;
  description: string;
  user_name: string;
  user_email: string;
  created_at: string;
  metadata?: Record<string, any>;
  comment_type?: string;
}

export function ValoracionActivityPanel({ valoracionId }: ValoracionActivityPanelProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [exportingPDF, setExportingPDF] = useState(false);
  
  const { comments, loading } = useValoracionComments(valoracionId);

  // Convertir comentarios a eventos de actividad
  const activities = useMemo((): ActivityEvent[] => {
    const commentActivities: ActivityEvent[] = comments.map(comment => ({
      id: comment.id,
      type: 'comment' as const,
      title: getCommentTypeLabel(comment.comment_type),
      description: comment.comment_text,
      user_name: comment.user_name || 'Usuario',
      user_email: comment.user_email || '',
      created_at: comment.created_at,
      comment_type: comment.comment_type,
      metadata: comment.metadata
    }));

    return commentActivities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [comments]);

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    
    return activities.filter(activity => {
      switch (filterType) {
        case 'comments':
          return activity.type === 'comment';
        case 'status_changes':
          return activity.type === 'comment' && 
                 (activity.comment_type === 'status_change' || activity.comment_type === 'phase_change');
        case 'approvals':
          return activity.type === 'comment' && 
                 (activity.comment_type === 'approval' || activity.comment_type === 'rejection');
        default:
          return true;
      }
    });
  }, [activities, filterType]);

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      // Simular exportación para ahora
      toast.success('Función de exportación PDF próximamente disponible');
    } catch (error) {
      toast.error('Error al exportar PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const getActivityIcon = (activity: ActivityEvent) => {
    switch (activity.type) {
      case 'comment':
        switch (activity.comment_type) {
          case 'approval':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
          case 'rejection':
            return <XCircle className="h-4 w-4 text-red-600" />;
          case 'status_change':
          case 'phase_change':
            return <AlertCircle className="h-4 w-4 text-amber-600" />;
          default:
            return <MessageSquare className="h-4 w-4 text-blue-600" />;
        }
      case 'document':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (activity: ActivityEvent) => {
    switch (activity.type) {
      case 'comment':
        switch (activity.comment_type) {
          case 'approval':
            return 'border-l-green-500';
          case 'rejection':
            return 'border-l-red-500';
          case 'status_change':
          case 'phase_change':
            return 'border-l-amber-500';
          default:
            return 'border-l-blue-500';
        }
      case 'document':
        return 'border-l-purple-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Panel de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Panel de Actividad
              <Badge variant="secondary">{activities.length} eventos</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las actividades</SelectItem>
                  <SelectItem value="comments">Solo comentarios</SelectItem>
                  <SelectItem value="status_changes">Cambios de estado</SelectItem>
                  <SelectItem value="approvals">Aprobaciones/Rechazos</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportPDF}
                disabled={exportingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                {exportingPDF ? 'Exportando...' : 'Exportar PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline de actividades */}
      <Card>
        <CardContent className="pt-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filterType === 'all' 
                  ? 'No hay actividades registradas aún'
                  : 'No hay actividades que coincidan con el filtro seleccionado'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className={`border-l-4 pl-4 pb-4 ${getActivityColor(activity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getActivityIcon(activity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{activity.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {activity.type === 'comment' ? 'Comentario' : 'Documento'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{activity.user_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < filteredActivities.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getCommentTypeLabel(type: string): string {
  const labels = {
    note: 'Nota añadida',
    status_change: 'Estado actualizado',
    phase_change: 'Fase cambiada',
    approval: 'Aprobación registrada',
    rejection: 'Rechazo registrado',
    document_update: 'Documento actualizado',
    assignment: 'Asignación modificada'
  };
  return labels[type as keyof typeof labels] || 'Actividad registrada';
}
