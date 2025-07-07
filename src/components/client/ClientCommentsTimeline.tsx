import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, User } from 'lucide-react';
import { MandateComment } from '@/types/BuyingMandate';

interface ClientCommentsTimelineProps {
  comments: MandateComment[];
}

export const ClientCommentsTimeline = ({ comments }: ClientCommentsTimelineProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCommentTypeInfo = (type: MandateComment['comment_type']) => {
    const typeConfig = {
      client_feedback: { label: 'Feedback', variant: 'secondary' as const, icon: MessageSquare },
      internal_note: { label: 'Nota Interna', variant: 'outline' as const, icon: User },
      status_update: { label: 'Actualización', variant: 'default' as const, icon: Clock },
    };
    return typeConfig[type] || typeConfig.status_update;
  };

  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comunicaciones</span>
          </CardTitle>
          <CardDescription>
            Actualizaciones y comunicaciones de su asesor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay comunicaciones disponibles aún
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Comunicaciones ({comments.length})</span>
        </CardTitle>
        <CardDescription>
          Actualizaciones y comunicaciones de su asesor sobre el proceso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.map((comment, index) => {
            const typeInfo = getCommentTypeInfo(comment.comment_type);
            const TypeIcon = typeInfo.icon;
            
            return (
              <div
                key={comment.id}
                className="relative"
              >
                {/* Timeline line */}
                {index < comments.length - 1 && (
                  <div className="absolute left-5 top-12 w-px h-8 bg-border" />
                )}
                
                <div className="flex space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <TypeIcon className="h-4 w-4 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={typeInfo.variant} className="text-xs">
                        {typeInfo.label}
                      </Badge>
                      <time className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </time>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.comment_text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};