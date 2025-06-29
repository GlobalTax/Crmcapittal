
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TargetCompany, TargetContact, CreateTargetCompanyData, CreateTargetContactData, TargetStatus } from '@/types/TargetCompany';
import { useToast } from '@/hooks/use-toast';

export const useTargetCompanies = () => {
  const [targetCompanies, setTargetCompanies] = useState<TargetCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTargetCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('target_companies')
        .select(`
          *,
          target_contacts (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTargetCompanies(data || []);
    } catch (err) {
      console.error('Error fetching target companies:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createTargetCompany = async (data: CreateTargetCompanyData): Promise<{ success: boolean; error?: string; data?: TargetCompany }> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const { data: newTarget, error } = await supabase
        .from('target_companies')
        .insert({
          ...data,
          created_by_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTargetCompanies();
      
      toast({
        title: "Éxito",
        description: "Empresa objetivo creada correctamente",
      });

      return { success: true, data: newTarget };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear la empresa objetivo';
      console.error('Error creating target company:', err);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      return { success: false, error: errorMsg };
    }
  };

  const updateTargetCompany = async (id: string, data: Partial<CreateTargetCompanyData>): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('target_companies')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await fetchTargetCompanies();
      
      toast({
        title: "Éxito",
        description: "Empresa objetivo actualizada correctamente",
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar la empresa objetivo';
      console.error('Error updating target company:', err);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      return { success: false, error: errorMsg };
    }
  };

  const deleteTargetCompany = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('target_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTargetCompanies();
      
      toast({
        title: "Éxito",
        description: "Empresa objetivo eliminada correctamente",
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar la empresa objetivo';
      console.error('Error deleting target company:', err);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      return { success: false, error: errorMsg };
    }
  };

  const updateStatus = async (id: string, status: TargetStatus): Promise<{ success: boolean; error?: string }> => {
    return updateTargetCompany(id, { status } as any);
  };

  const createTargetContact = async (data: CreateTargetContactData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('target_contacts')
        .insert(data);

      if (error) throw error;

      await fetchTargetCompanies();
      
      toast({
        title: "Éxito",
        description: "Contacto creado correctamente",
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear el contacto';
      console.error('Error creating target contact:', err);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      return { success: false, error: errorMsg };
    }
  };

  const updateTargetContact = async (id: string, data: Partial<CreateTargetContactData>): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('target_contacts')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await fetchTargetCompanies();
      
      toast({
        title: "Éxito",
        description: "Contacto actualizado correctamente",
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar el contacto';
      console.error('Error updating target contact:', err);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      return { success: false, error: errorMsg };
    }
  };

  const deleteTargetContact = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('target_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTargetCompanies();
      
      toast({
        title: "Éxito",
        description: "Contacto eliminado correctamente",
      });

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar el contacto';
      console.error('Error deleting target contact:', err);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      return { success: false, error: errorMsg };
    }
  };

  const bulkImportTargets = async (targets: CreateTargetCompanyData[]): Promise<{ success: boolean; error?: string; successCount?: number; duplicateCount?: number }> => {
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const targetsWithUser = targets.map(target => ({
        ...target,
        created_by_user_id: user.id
      }));

      const { data, error } = await supabase
        .from('target_companies')
        .insert(targetsWithUser)
        .select();

      if (error) {
        // Handle duplicate entries
        if (error.code === '23505') {
          return { success: false, error: 'Algunas empresas ya existen en la base de datos' };
        }
        throw error;
      }

      await fetchTargetCompanies();
      
      toast({
        title: "Éxito",
        description: `Se han importado ${data?.length || 0} empresas objetivo correctamente`,
      });

      return { 
        success: true, 
        successCount: data?.length || 0,
        duplicateCount: targets.length - (data?.length || 0)
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error en la importación masiva';
      console.error('Error bulk importing targets:', err);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });

      return { success: false, error: errorMsg };
    }
  };

  useEffect(() => {
    if (user) {
      fetchTargetCompanies();
    }
  }, [user]);

  return {
    targetCompanies,
    loading,
    error,
    createTargetCompany,
    updateTargetCompany,
    deleteTargetCompany,
    updateStatus,
    createTargetContact,
    updateTargetContact,
    deleteTargetContact,
    bulkImportTargets,
    refetch: fetchTargetCompanies
  };
};
