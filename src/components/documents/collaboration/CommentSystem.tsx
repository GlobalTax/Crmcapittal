import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Reply, Check, Trash2, Edit3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDocumentComments } from '@/hooks/useDocumentComments';
import { DocumentComment } from '@/types/DocumentCollaboration';
import { logger } from '@/utils/productionLogger';

interface CommentSystemProps {
  documentId: string;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({ documentId }) => {
  const { comments, loading, createComment, updateComment, deleteComment, resolveComment } = useDocumentComments(documentId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createComment({
        document_id: documentId,
        content: newComment,
        thread_id: replyingTo || undefined
      });
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      logger.error('Failed to create comment', { error, documentId });
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      logger.error('Failed to update comment', { error, commentId });
    }
  };

  const startEdit = (comment: DocumentComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return email ? email[0].toUpperCase() : '?';
  };

  const CommentItem: React.FC<{ comment: DocumentComment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <Card className={`p-4 ${isReply ? 'ml-8 mt-2' : 'mb-4'} ${comment.resolved ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(comment.author?.first_name, comment.author?.last_name, comment.author?.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {comment.author?.first_name && comment.author?.last_name 
                ? `${comment.author.first_name} ${comment.author.last_name}`
                : comment.author?.email || 'Usuario desconocido'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
            </p>
          </div>
          {comment.resolved && (
            <Badge variant="secondary" className="ml-2">
              <Check className="h-3 w-3 mr-1" />
              Resuelto
            </Badge>
          )}
        </div>
        
        <div className="flex gap-1">
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="h-8 w-8 p-0"
            >
              <Reply className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startEdit(comment)}
            className="h-8 w-8 p-0"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          {!comment.resolved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resolveComment(comment.id)}
              className="h-8 w-8 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteComment(comment.id)}
            className="h-8 w-8 p-0 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {editingComment === comment.id ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Editar comentario..."
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleEditComment(comment.id)}
              disabled={!editContent.trim()}
            >
              Guardar
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setEditingComment(null);
                setEditContent('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm">{comment.content}</p>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comentarios</h3>
        <Badge variant="secondary">{comments.length}</Badge>
      </div>

      {/* Nuevo comentario */}
      <Card className="p-4">
        <div className="space-y-3">
          {replyingTo && (
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <p className="text-sm">Respondiendo a comentario</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReplyingTo(null)}
              >
                ✕
              </Button>
            </div>
          )}
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Escribe tu respuesta..." : "Añadir un comentario..."}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || loading}
            >
              {replyingTo ? 'Responder' : 'Comentar'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de comentarios */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No hay comentarios aún</p>
          <p className="text-sm text-muted-foreground">Sé el primero en comentar este documento</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};