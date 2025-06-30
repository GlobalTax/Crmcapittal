
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PracticeArea, CreatePracticeAreaData, UpdatePracticeAreaData } from '@/types/PracticeArea';
import { useToast } from '@/hooks/use-toast';

export const usePracticeAreas = () => {
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPracticeAreas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('practice_areas')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPracticeAreas(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar áreas de práctica';
      setError(errorMessage);
      console.error('Error fetching practice areas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPracticeArea = async (data: CreatePracticeAreaData) => {
    try {
      const { data: newArea, error } = await supabase
        .from('practice_areas')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setPracticeAreas(prev => [...prev, newArea]);
      toast({
        title: "Área de práctica creada",
        description: `${newArea.name} ha sido creada correctamente.`,
      });
      return newArea;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear área de práctica';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updatePracticeArea = async (id: string, updates: UpdatePracticeAreaData) => {
    try {
      const { data: updatedArea, error } = await supabase
        .from('practice_areas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPracticeAreas(prev => 
        prev.map(area => area.id === id ? updatedArea : area)
      );
      toast({
        title: "Área de práctica actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });
      return updatedArea;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar área de práctica';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deletePracticeArea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('practice_areas')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setPracticeAreas(prev => prev.filter(area => area.id !== id));
      toast({
        title: "Área de práctica desactivada",
        description: "El área de práctica ha sido desactivada correctamente.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desactivar área de práctica';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchPracticeAreas();
  }, []);

  return {
    practiceAreas,
    loading,
    error,
    createPracticeArea,
    updatePracticeArea,
    deletePracticeArea,
    refetch: fetchPracticeAreas
  };
};
