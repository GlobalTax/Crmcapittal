import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentFolder, FolderTreeItem } from '@/types/DocumentFolder';

export const useDocumentFolders = () => {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('document_folders')
        .select(`
          *,
          companies!document_folders_client_id_fkey(name)
        `)
        .order('name');

      if (error) throw error;
      setFolders((data || []) as DocumentFolder[]);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las carpetas",
        variant: "destructive",
      });
    }
  };

  const createFolder = async (folderData: Partial<DocumentFolder>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('document_folders')
        .insert({
          name: folderData.name,
          parent_folder_id: folderData.parent_folder_id,
          folder_type: folderData.folder_type || 'general',
          client_id: folderData.client_id,
          project_id: folderData.project_id,
          metadata: folderData.metadata || {},
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [...prev, data as DocumentFolder]);
      toast({
        title: "Éxito",
        description: "Carpeta creada correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la carpeta",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateFolder = async (id: string, updates: Partial<DocumentFolder>) => {
    try {
      const { data, error } = await supabase
        .from('document_folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => 
        prev.map(folder => folder.id === id ? { ...folder, ...data as DocumentFolder } : folder)
      );

      toast({
        title: "Éxito",
        description: "Carpeta actualizada correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error updating folder:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la carpeta",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFolders(prev => prev.filter(folder => folder.id !== id));
      toast({
        title: "Éxito",
        description: "Carpeta eliminada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la carpeta",
        variant: "destructive",
      });
      return false;
    }
  };

  const buildFolderTree = (parentId: string | null = null, depth = 0): FolderTreeItem[] => {
    return folders
      .filter(folder => folder.parent_folder_id === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderTree(folder.id, depth + 1),
        depth
      }));
  };

  const moveDocumentToFolder = async (documentId: string, folderId: string | null) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ folder_id: folderId })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documento movido correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error moving document:', error);
      toast({
        title: "Error",
        description: "No se pudo mover el documento",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFolders();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    folders,
    loading,
    createFolder,
    updateFolder,
    deleteFolder,
    buildFolderTree,
    moveDocumentToFolder,
    refetch: fetchFolders,
  };
};