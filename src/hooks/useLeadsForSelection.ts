import { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    const fetchLeads = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, company_name, status')
          .abortSignal(controller.signal)
          .order('name');

        if (error) throw error;

        if (isMounted.current) {
          setLeads(data || []);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        if (isMounted.current) {
          setLeads([]);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchLeads();

    return () => {
      controller.abort();
      isMounted.current = false;
    };
  }, [user]);

  return { leads, loading };
};