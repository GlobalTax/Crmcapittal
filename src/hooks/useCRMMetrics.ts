import { useQuery } from '@tanstack/react-query';
import { useLeads } from './useLeads';
import { useCompanies } from './useCompanies';
import { useBuyingMandates } from './useBuyingMandates';

export const useCRMMetrics = () => {
  const { leads } = useLeads();
  const { totalCount: companiesCount } = useCompanies({ limit: 1 });
  const { mandates, targets } = useBuyingMandates();

  const metrics = {
    leadsCount: leads.length,
    companiesCount,
    mandatesCount: mandates.length,
    targetsCount: targets.length
  };

  return {
    metrics,
    isLoading: false,
    error: null
  };
};