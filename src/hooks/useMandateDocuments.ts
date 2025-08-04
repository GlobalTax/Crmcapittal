import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { MandateDocument, CreateMandateDocumentData } from '@/types/MandateDocument';

export const useMandateDocuments = (mandateId?: string) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MandateDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    if (!mandateId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mandate_documents')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching mandate documents:', error);
      toast.error('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [mandateId]);

  const uploadDocument = async (
    file: File,
    documentData: Omit<CreateMandateDocumentData, 'document_name' | 'file_url' | 'file_size' | 'content_type'>
  ): Promise<MandateDocument | null> => {
    if (!user || !mandateId) {
      toast.error('Usuario no autenticado');
      return null;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${user.id}/${mandateId}/${timestamp}_${file.name}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('mandate-documents')
        .upload(filename, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('mandate-documents')
        .getPublicUrl(filename);

      // Create document record
      const documentRecord: CreateMandateDocumentData = {
        ...documentData,
        mandate_id: mandateId,
        document_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        content_type: file.type,
        uploaded_by: user.id,
      };

      const { data, error } = await supabase
        .from('mandate_documents')
        .insert(documentRecord)
        .select()
        .single();

      if (error) throw error;

      toast.success('Documento subido exitosamente');
      await fetchDocuments();
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error al subir el documento');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateDocumentType = async (documentId: string, documentType: string) => {
    try {
      const { error } = await supabase
        .from('mandate_documents')
        .update({ document_type: documentType })
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Tipo de documento actualizado');
      await fetchDocuments();
    } catch (error) {
      console.error('Error updating document type:', error);
      toast.error('Error al actualizar el tipo de documento');
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document info first
      const { data: doc, error: fetchError } = await supabase
        .from('mandate_documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      const url = new URL(doc.file_url);
      const filePath = url.pathname.split('/mandate-documents/')[1];

      // Delete from storage
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('mandate-documents')
          .remove([filePath]);

        if (storageError) {
          console.warn('Error deleting file from storage:', storageError);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('mandate_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Documento eliminado');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error al eliminar el documento');
    }
  };

  const downloadDocument = async (document: MandateDocument) => {
    try {
      // Extract file path from URL
      const url = new URL(document.file_url);
      const filePath = url.pathname.split('/mandate-documents/')[1];

      if (!filePath) {
        throw new Error('Invalid file path');
      }

      const { data, error } = await supabase.storage
        .from('mandate-documents')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const blob = new Blob([data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.document_name;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Documento descargado');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Error al descargar el documento');
    }
  };

  const getDocumentsByType = (documentType: string): MandateDocument[] => {
    return documents.filter(doc => doc.document_type === documentType);
  };

  const getDocumentCounts = (): Record<string, number> => {
    return documents.reduce((acc, doc) => {
      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    updateDocumentType,
    deleteDocument,
    downloadDocument,
    getDocumentsByType,
    getDocumentCounts,
    refetch: fetchDocuments,
  };
};