import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DealDocument, CreateDealDocumentData, DocumentStatus } from '@/types/DealDocument';
import { useToast } from '@/hooks/use-toast';

export const useDealDocuments = (dealId?: string) => {
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!dealId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deal_documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as DealDocument[]);
    } catch (error) {
      console.error('Error fetching deal documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentData: Omit<CreateDealDocumentData, 'file_name' | 'file_url' | 'file_size' | 'content_type'>) => {
    if (!dealId) return null;

    try {
      setUploading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${dealId}/${Date.now()}_${file.name}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deal-documents')
        .getPublicUrl(uploadData.path);

      // Create document record
      const documentRecord = {
        ...documentData,
        deal_id: dealId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        content_type: file.type,
        uploaded_by: user.id
      };

      const { data, error } = await supabase
        .from('deal_documents')
        .insert(documentRecord)
        .select()
        .single();

      if (error) throw error;

      // Refresh documents list
      await fetchDocuments();

      toast({
        title: "Éxito",
        description: "Documento subido correctamente"
      });

      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Error al subir el documento",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateDocumentStatus = async (documentId: string, status: DocumentStatus) => {
    try {
      const { error } = await supabase
        .from('deal_documents')
        .update({ document_status: status })
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, document_status: status }
            : doc
        )
      );

      toast({
        title: "Éxito",
        description: "Estado del documento actualizado"
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) return;

      // Delete from storage first
      const path = document.file_url.split('/').slice(-3).join('/'); // Extract path from URL
      await supabase.storage
        .from('deal-documents')
        .remove([path]);

      // Delete from database
      const { error } = await supabase
        .from('deal_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente"
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el documento",
        variant: "destructive"
      });
    }
  };

  const downloadDocument = async (document: DealDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .download(document.file_url.split('/').slice(-3).join('/'));

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Error al descargar el documento",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  const getDocumentsByCategory = (category: string) => {
    return documents.filter(doc => doc.document_category === category);
  };

  const getDocumentCounts = () => {
    return documents.reduce((acc, doc) => {
      acc[doc.document_category] = (acc[doc.document_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    updateDocumentStatus,
    deleteDocument,
    downloadDocument,
    getDocumentsByCategory,
    getDocumentCounts,
    refetch: fetchDocuments
  };
};