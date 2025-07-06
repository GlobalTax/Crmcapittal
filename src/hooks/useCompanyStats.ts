import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyStats {
  contactsCount: number;
  activeDealsCount: number;
  totalPipelineValue: number;
  isLoading: boolean;
  error: string | null;
}

export const useCompanyStats = (companyId: string, companyName?: string) => {
  const [stats, setStats] = useState<CompanyStats>({
    contactsCount: 0,
    activeDealsCount: 0,
    totalPipelineValue: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!companyId) return;

      try {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));

        // Get contacts count
        const { count: contactsCount, error: contactsError } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId);

        if (contactsError) throw contactsError;

        // Get deals stats (using company_name since deals table uses company_name field)
        let activeDealsCount = 0;
        let totalPipelineValue = 0;

        if (companyName) {
          const { data: deals, error: dealsError } = await supabase
            .from('deals')
            .select('deal_value')
            .ilike('company_name', `%${companyName}%`)
            .eq('is_active', true);

          if (dealsError) throw dealsError;

          activeDealsCount = deals?.length || 0;
          totalPipelineValue = deals?.reduce((sum, deal) => sum + (deal.deal_value || 0), 0) || 0;
        }

        setStats({
          contactsCount: contactsCount || 0,
          activeDealsCount,
          totalPipelineValue,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching company stats:', err);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Error al cargar estadísticas',
        }));
      }
    };

    fetchStats();
  }, [companyId, companyName]);

  return stats;
};