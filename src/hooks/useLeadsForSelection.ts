import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeadOption {
  id: string;
  name: string;
  company_name?: string;
  status: string;
}

export const useLeadsForSelection = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, company_name, status')
          .order('name');

        if (error) throw error;

        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  return { leads, loading };
};