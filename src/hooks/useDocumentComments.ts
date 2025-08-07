import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentComment, CreateCommentData } from '@/types/DocumentCollaboration';
import { useToast } from '@/hooks/useToast';

export const useDocumentComments = (documentId?: string) => {
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select(`
          *,
          mentions:document_mentions (
            id,
            mentioned_user_id
          )
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organizar comentarios en hilos
      const topLevelComments = data?.filter(comment => !comment.thread_id) || [];
      const replies = data?.filter(comment => comment.thread_id) || [];

      const commentsWithReplies = topLevelComments.map(comment => ({
        ...comment,
        author: { id: comment.created_by, email: '', first_name: '', last_name: '' },
        replies: replies.filter(reply => reply.thread_id === comment.id).map(reply => ({
          ...reply,
          author: { id: reply.created_by, email: '', first_name: '', last_name: '' },
          mentions: reply.mentions || []
        })),
        mentions: comment.mentions || []
      }));

      setComments(commentsWithReplies as DocumentComment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (commentData: CreateCommentData) => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .insert([{
          document_id: commentData.document_id,
          content: commentData.content,
          position_data: commentData.position_data,
          thread_id: commentData.thread_id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Crear menciones si las hay
      if (commentData.mentions && commentData.mentions.length > 0) {
        const mentionsData = commentData.mentions.map(userId => ({
          comment_id: data.id,
          mentioned_user_id: userId
        }));

        await supabase
          .from('document_mentions')
          .insert(mentionsData);
      }

      await fetchComments();
      
      toast({
        title: "Comentario añadido",
        description: "Tu comentario se ha añadido correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el comentario",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      
      toast({
        title: "Comentario actualizado",
        description: "El comentario se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el comentario",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      
      toast({
        title: "Comentario eliminado",
        description: "El comentario se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive",
      });
    }
  };

  const resolveComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({
          resolved: true,
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      
      toast({
        title: "Comentario resuelto",
        description: "El comentario se ha marcado como resuelto",
      });
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast({
        title: "Error",
        description: "No se pudo resolver el comentario",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchComments();

    if (!documentId) return;

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('document-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_comments',
          filter: `document_id=eq.${documentId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  return {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    refetch: fetchComments
  };
};