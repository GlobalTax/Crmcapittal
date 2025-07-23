import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ValoracionDocument, DocumentReviewStatus } from '@/types/Valoracion';
import { toast } from '@/hooks/useToast';

export const useValoracionDocuments = (valoracionId: string) => {
  const [documents, setDocuments] = useState<ValoracionDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('valoracion_documents')
        .select('*')
        .eq('valoracion_id', valoracionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error al cargar documentos',
        description: 'No se pudieron cargar los documentos de la valoración',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentReviewStatus = async (
    documentId: string, 
    newStatus: DocumentReviewStatus,
    notes?: string
  ) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) throw new Error('Documento no encontrado');

      // Update document status
      const { error: updateError } = await (supabase as any)
        .from('valoracion_documents')
        .update({ review_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // Create review history entry
      const { error: historyError } = await (supabase as any)
        .from('valoracion_document_reviews')
        .insert({
          document_id: documentId,
          previous_status: document.review_status,
          new_status: newStatus,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          review_notes: notes
        });

      if (historyError) throw historyError;

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, review_status: newStatus, updated_at: new Date().toISOString() }
          : doc
      ));

      toast({
        title: 'Estado actualizado',
        description: `El documento ha sido marcado como ${getStatusLabel(newStatus)}`
      });

    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: 'Error al actualizar estado',
        description: 'No se pudo actualizar el estado del documento',
        variant: 'destructive'
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) throw new Error('Documento no encontrado');

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('valoracion-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await (supabase as any)
        .from('valoracion_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: 'Documento eliminado',
        description: 'El documento se eliminó correctamente'
      });

    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar el documento',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (valoracionId) {
      fetchDocuments();
    }
  }, [valoracionId]);

  return {
    documents,
    loading,
    fetchDocuments,
    updateDocumentReviewStatus,
    deleteDocument
  };
};

const getStatusLabel = (status: DocumentReviewStatus): string => {
  const labels = {
    pending: 'pendiente',
    approved: 'aprobado',
    rejected: 'rechazado',
    under_review: 'en revisión'
  };
  return labels[status];
};