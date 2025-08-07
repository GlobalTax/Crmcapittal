import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentVersion } from '@/types/DocumentFolder';

export const useDocumentVersions = (documentId?: string) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVersions = async (docId: string) => {
    if (!docId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', docId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions((data || []) as DocumentVersion[]);
    } catch (error) {
      console.error('Error fetching document versions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las versiones del documento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (versionId: string, documentId: string) => {
    try {
      // Obtener la versión a restaurar
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Actualizar el documento con el contenido de la versión
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          title: version.title,
          content: version.content,
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      toast({
        title: "Éxito",
        description: "Versión restaurada correctamente",
      });

      // Recargar versiones
      await fetchVersions(documentId);
      
      return true;
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: "Error",
        description: "No se pudo restaurar la versión",
        variant: "destructive",
      });
      return false;
    }
  };

  const compareVersions = (version1: DocumentVersion, version2: DocumentVersion) => {
    // Implementación básica de comparación
    // En una implementación real, usarías una librería como diff-match-patch
    return {
      title: version1.title !== version2.title,
      content: JSON.stringify(version1.content) !== JSON.stringify(version2.content),
      version1,
      version2,
    };
  };

  useEffect(() => {
    if (documentId) {
      fetchVersions(documentId);
    }
  }, [documentId]);

  return {
    versions,
    loading,
    fetchVersions,
    restoreVersion,
    compareVersions,
    refetch: () => documentId && fetchVersions(documentId),
  };
};