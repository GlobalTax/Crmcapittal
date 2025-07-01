import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Case, CreateCaseData, UpdateCaseData } from '@/types/Case';
import { useToast } from '@/hooks/use-toast';

export const useCases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color),
          proposal:proposals(id, title, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases((data || []) as Case[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar expedientes';
      setError(errorMessage);
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (data: CreateCaseData) => {
    try {
      const { data: newCase, error } = await supabase
        .from('cases')
        .insert(data as any) // Type assertion to bypass the case_number requirement
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color),
          proposal:proposals(id, title, status)
        `)
        .single();

      if (error) throw error;

      setCases(prev => [newCase as Case, ...prev]);
      toast({
        title: "Expediente creado",
        description: `Expediente ${newCase.case_number} creado correctamente.`,
      });
      return newCase as Case;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear expediente';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateCase = async (id: string, updates: UpdateCaseData) => {
    try {
      const { data: updatedCase, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          contact:contacts(id, name, email),
          company:companies(id, name),
          practice_area:practice_areas(id, name, color),
          proposal:proposals(id, title, status)
        `)
        .single();

      if (error) throw error;

      setCases(prev => 
        prev.map(caseItem => caseItem.id === id ? updatedCase as Case : caseItem)
      );
      toast({
        title: "Expediente actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedCase as Case;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar expediente';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteCase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCases(prev => prev.filter(caseItem => caseItem.id !== id));
      toast({
        title: "Expediente eliminado",
        description: "El expediente ha sido eliminado correctamente.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar expediente';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return {
    cases,
    loading,
    error,
    createCase,
    updateCase,
    deleteCase,
    refetch: fetchCases
  };
};
