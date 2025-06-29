
import { useState, useEffect } from 'react';
import { TargetCompany, TargetStatus } from '@/types/TargetCompany';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTargetCompanies = () => {
  const [targetCompanies, setTargetCompanies] = useState<TargetCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTargetCompanies = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('target_companies')
        .select(`
          *,
          target_contacts (
            id,
            name,
            title,
            email,
            linkedin_url
          ),
          stages (
            id,
            name,
            color,
            order_index
          )
        `)
        .eq('created_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedData = (data || []).map(company => ({
        ...company,
        contacts: company.target_contacts || [],
        stage: company.stages
      }));

      setTargetCompanies(transformedData);
    } catch (err) {
      console.error('Error fetching target companies:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createTargetCompany = async (companyData: Omit<TargetCompany, 'id' | 'created_at' | 'updated_at' | 'created_by_user_id' | 'contacts'>) => {
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    try {
      const { data, error } = await supabase
        .from('target_companies')
        .insert([{
          ...companyData,
          created_by_user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTargetCompanies(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating target company:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const updateTargetCompany = async (id: string, updates: Partial<TargetCompany>) => {
    try {
      const { data, error } = await supabase
        .from('target_companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTargetCompanies(prev => prev.map(company => 
        company.id === id ? { ...company, ...data } : company
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating target company:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const updateStatus = async (id: string, status: TargetStatus, stageId?: string) => {
    try {
      const updates: any = { status };
      if (stageId) {
        updates.stage_id = stageId;
      }

      const { data, error } = await supabase
        .from('target_companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTargetCompanies(prev => prev.map(company => 
        company.id === id ? { ...company, ...data } : company
      ));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating status:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const deleteTargetCompany = async (id: string) => {
    try {
      const { error } = await supabase
        .from('target_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTargetCompanies(prev => prev.filter(company => company.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting target company:', err);
      return { error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  // Métodos adicionales para compatibilidad con los componentes existentes
  const bulkImportTargets = async (targets: any[]) => {
    try {
      const { data, error } = await supabase
        .from('target_companies')
        .insert(targets.map(target => ({
          ...target,
          created_by_user_id: user?.id
        })))
        .select();

      if (error) throw error;

      setTargetCompanies(prev => [...data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error bulk importing targets:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const createTargetContact = async (contactData: any) => {
    try {
      const { data, error } = await supabase
        .from('target_contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) throw error;

      // Refresh target companies to get updated contacts
      await fetchTargetCompanies();
      return { data, error: null };
    } catch (err) {
      console.error('Error creating target contact:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const deleteTargetContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('target_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      // Refresh target companies to get updated contacts
      await fetchTargetCompanies();
      return { error: null };
    } catch (err) {
      console.error('Error deleting target contact:', err);
      return { error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  useEffect(() => {
    fetchTargetCompanies();
  }, [user]);

  return {
    targetCompanies,
    loading,
    error,
    createTargetCompany,
    updateTargetCompany,
    updateStatus,
    deleteTargetCompany,
    bulkImportTargets,
    createTargetContact,
    deleteTargetContact,
    refetch: fetchTargetCompanies
  };
};
