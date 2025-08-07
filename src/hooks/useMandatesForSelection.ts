import { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    const fetchMandates = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('buying_mandates')
          .select('id, mandate_name, client_name, status')
          .eq('status', 'active')
          .abortSignal(controller.signal)
          .order('mandate_name');

        if (error) throw error;

        if (isMounted.current) {
          setMandates(data || []);
        }
      } catch (error) {
        console.error('Error fetching mandates:', error);
        if (isMounted.current) {
          setMandates([]);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchMandates();

    return () => {
      controller.abort();
      isMounted.current = false;
    };
  }, [user]);

  return { mandates, loading };
};