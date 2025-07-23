
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
      // Temporalmente devolvemos array vacío hasta que la tabla exista
      console.log('Comments table not yet created for valoracion:', valoracionId);
      setComments([]);
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
      // Temporalmente mostramos mensaje hasta que la tabla exista
      toast.info('Sistema de comentarios en desarrollo');
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
      toast.info('Sistema de comentarios en desarrollo');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error al actualizar comentario');
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      toast.info('Sistema de comentarios en desarrollo');
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
