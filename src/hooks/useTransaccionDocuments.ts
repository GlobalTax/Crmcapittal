import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransaccionDocument {
  id: string;
  transaccion_id: string;
  name: string;
  file_url: string;
  file_size: number;
  content_type: string;
  category: 'contract' | 'presentation' | 'financial' | 'legal' | 'other';
  uploaded_at: string;
  uploaded_by?: string;
}

export const useTransaccionDocuments = (transaccionId: string) => {
  const [documents, setDocuments] = useState<TransaccionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!transaccionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, we'll use mock data since we need to establish the relationship
      // You could create a transaccion_documents table or extend existing structure
      const mockDocuments: TransaccionDocument[] = [];

      setDocuments(mockDocuments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los documentos';
      setError(errorMessage);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (
    file: File, 
    category: TransaccionDocument['category'] = 'other'
  ) => {
    try {
      setUploading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user) {
        throw new Error('Usuario no autenticado');
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${transaccionId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('transaccion-documents') // This bucket would need to be created
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('transaccion-documents')
        .getPublicUrl(fileName);

      // Create document record
      const newDocument: TransaccionDocument = {
        id: Date.now().toString(),
        transaccion_id: transaccionId,
        name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        content_type: file.type,
        category,
        uploaded_at: new Date().toISOString(),
        uploaded_by: user.user.id
      };

      setDocuments(prev => [newDocument, ...prev]);
      
      toast({
        title: "Documento subido",
        description: `${file.name} ha sido subido correctamente.`,
      });

      return { data: newDocument, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir el documento';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error uploading document:', err);
      return { data: null, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (!document) return { error: 'Documento no encontrado' };

      // Delete from storage
      const fileName = document.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('transaccion-documents')
          .remove([fileName]);
      }

      // Remove from state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente.",
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el documento';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting document:', err);
      return { error: errorMessage };
    }
  };

  const downloadDocument = async (doc: TransaccionDocument) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Descarga iniciada",
        description: `Descargando ${doc.name}...`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al descargar el documento';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error downloading document:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [transaccionId]);

  return {
    documents,
    loading,
    error,
    uploading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    refetch: fetchDocuments
  };
};