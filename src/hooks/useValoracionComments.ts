import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ValoracionComment {
  id: string;
  valoracion_id: string;
  user_id: string;
  comment_text: string;
  comment_type: 'note' | 'status_change' | 'phase_change' | 'approval' | 'rejection' | 'document_update' | 'assignment';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export function useValoracionComments(valoracionId?: string) {
  const [comments, setComments] = useState<ValoracionComment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!valoracionId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('valoracion_comments' as any)
        .select(`
          *,
          user:user_id (
            email
          )
        `)
        .eq('valoracion_id', valoracionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const commentsWithUserInfo = (data as any)?.map((comment: any) => ({
        ...comment,
        user_email: comment.user?.email || 'Usuario desconocido',
        user_name: comment.user?.email?.split('@')[0] || 'Usuario'
      })) || [];

      setComments(commentsWithUserInfo);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (commentData: {
    comment_text: string;
    comment_type: ValoracionComment['comment_type'];
    metadata?: Record<string, any>;
  }): Promise<void> => {
    if (!valoracionId) return;

    try {
      const { error } = await supabase
        .from('valoracion_comments' as any)
        .insert({
          valoracion_id: valoracionId,
          ...commentData,
          metadata: commentData.metadata || {}
        });

      if (error) throw error;

      toast.success('Comentario añadido');
      loadComments(); // Reload to get updated list
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al añadir comentario');
      throw error;
    }
  };

  const updateComment = async (commentId: string, updates: {
    comment_text?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { error } = await supabase
        .from('valoracion_comments' as any)
        .update(updates)
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comentario actualizado');
      loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error al actualizar comentario');
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('valoracion_comments' as any)
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comentario eliminado');
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar comentario');
      throw error;
    }
  };

  useEffect(() => {
    loadComments();
  }, [valoracionId]);

  return {
    comments,
    loading,
    loadComments,
    addComment,
    updateComment,
    deleteComment
  };
}