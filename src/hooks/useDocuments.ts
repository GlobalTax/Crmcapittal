import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Document, DocumentTemplate } from '@/types/Document';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates((data || []) as DocumentTemplate[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    }
  };

  const createDocument = async (documentData: Partial<Document>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: documentData.title || '',
          content: documentData.content as any,
          template_id: documentData.template_id,
          document_type: documentData.document_type || 'general',
          status: documentData.status || 'draft',
          variables: documentData.variables as any,
          metadata: documentData.metadata as any,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [data as Document, ...prev]);
      toast({
        title: "Éxito",
        description: "Documento creado correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el documento",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          variables: updates.variables as any,
          content: updates.content as any,
          metadata: updates.metadata as any
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => 
        prev.map(doc => doc.id === id ? { ...doc, ...data as Document } : doc)
      );

      toast({
        title: "Éxito",
        description: "Documento actualizado correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el documento",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDocuments(), fetchTemplates()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    documents,
    templates,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch: () => Promise.all([fetchDocuments(), fetchTemplates()]),
  };
};