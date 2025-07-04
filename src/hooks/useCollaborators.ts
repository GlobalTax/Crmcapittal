import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Collaborator, CreateCollaboratorData } from '@/types/Collaborator';
import { useToast } from '@/hooks/use-toast';

export const useCollaborators = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborators((data || []) as Collaborator[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar colaboradores';
      setError(errorMessage);
      console.error('Error fetching collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCollaborator = async (data: CreateCollaboratorData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: newCollaborator, error } = await supabase
        .from('collaborators')
        .insert([{
          ...data,
          created_by: user?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setCollaborators(prev => [newCollaborator as Collaborator, ...prev]);
      toast({
        title: "Colaborador creado",
        description: "El colaborador ha sido creado correctamente.",
      });
      return newCollaborator as Collaborator;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear colaborador';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateCollaborator = async (id: string, updates: Partial<Collaborator>) => {
    try {
      const { data: updatedCollaborator, error } = await supabase
        .from('collaborators')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCollaborators(prev => 
        prev.map(collaborator => collaborator.id === id ? updatedCollaborator as Collaborator : collaborator)
      );
      toast({
        title: "Colaborador actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedCollaborator as Collaborator;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar colaborador';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteCollaborator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCollaborators(prev => prev.filter(collaborator => collaborator.id !== id));
      toast({
        title: "Colaborador eliminado",
        description: "El colaborador ha sido eliminado correctamente.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar colaborador';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  return {
    collaborators,
    loading,
    error,
    createCollaborator,
    updateCollaborator,
    deleteCollaborator,
    refetch: fetchCollaborators
  };
};