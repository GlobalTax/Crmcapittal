import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MandatePerson {
  id: string;
  mandate_id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  company?: string;
  is_primary: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useMandatePeople = (mandateId: string) => {
  const [people, setPeople] = useState<MandatePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPeople = async () => {
    if (!mandateId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('mandate_people')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPeople(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las personas';
      setError(errorMessage);
      console.error('Error fetching mandate people:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPerson = async (personData: Omit<MandatePerson, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('mandate_people')
        .insert({
          ...personData,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPeople(prev => [data, ...prev]);
      
      toast({
        title: "Persona agregada",
        description: "La persona ha sido agregada exitosamente.",
      });

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar la persona';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error creating mandate person:', err);
      return { data: null, error: errorMessage };
    }
  };

  const updatePerson = async (personId: string, updates: Partial<MandatePerson>) => {
    try {
      const { error } = await supabase
        .from('mandate_people')
        .update(updates)
        .eq('id', personId);

      if (error) {
        throw error;
      }

      setPeople(prev => prev.map(person => 
        person.id === personId 
          ? { ...person, ...updates }
          : person
      ));
      
      toast({
        title: "Persona actualizada",
        description: "La persona ha sido actualizada exitosamente.",
      });

      return { data: null, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la persona';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating mandate person:', err);
      return { data: null, error: errorMessage };
    }
  };

  const deletePerson = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('mandate_people')
        .delete()
        .eq('id', personId);

      if (error) {
        throw error;
      }

      setPeople(prev => prev.filter(person => person.id !== personId));
      
      toast({
        title: "Persona eliminada",
        description: "La persona ha sido eliminada exitosamente.",
      });

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la persona';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error deleting mandate person:', err);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [mandateId]);

  return {
    people,
    loading,
    error,
    createPerson,
    updatePerson,
    deletePerson,
    refetch: fetchPeople
  };
};