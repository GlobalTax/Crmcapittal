import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MandateOption {
  id: string;
  mandate_name: string;
  client_name: string;
  status: string;
}

export const useMandatesForSelection = () => {
  const { user } = useAuth();
  const [mandates, setMandates] = useState<MandateOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchMandates = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('buying_mandates')
          .select('id, mandate_name, client_name, status')
          .eq('status', 'active')
          .order('mandate_name');

        if (error) throw error;

        setMandates(data || []);
      } catch (error) {
        console.error('Error fetching mandates:', error);
        setMandates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMandates();
  }, [user]);

  return { mandates, loading };
};