
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
      // Primero obtenemos los comentarios
      const { data: commentsData, error: commentsError } = await supabase
        .from('valoracion_comments')
        .select('*')
        .eq('valoracion_id', valoracionId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Luego obtenemos la información de usuarios para cada comentario
      const commentsWithUserInfo = await Promise.all(
        (commentsData || []).map(async (comment) => {
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(comment.user_id);
            
            return {
              ...comment,
              user_email: userData?.user?.email || 'Usuario desconocido',
              user_name: userData?.user?.email?.split('@')[0] || 'Usuario'
            };
          } catch (error) {
            console.warn('Error loading user info for comment:', comment.id, error);
            return {
              ...comment,
              user_email: 'Usuario desconocido',
              user_name: 'Usuario'
            };
          }
        })
      );

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('valoracion_comments')
        .insert({
          valoracion_id: valoracionId,
          user_id: user.id,
          ...commentData,
          metadata: commentData.metadata || {}
        });

      if (error) throw error;

      toast.success('Comentario añadido');
      await loadComments(); // Reload to get updated list
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
        .from('valoracion_comments')
        .update(updates)
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comentario actualizado');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error al actualizar comentario');
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('valoracion_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comentario eliminado');
      await loadComments();
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
