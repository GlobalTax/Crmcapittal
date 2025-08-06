import { useQuery } from '@tanstack/react-query';
import { useLeads } from './useLeads';
import { useCompanies } from './useCompanies';
import { useBuyingMandates } from './useBuyingMandates';

type CRMTabType = 'leads' | 'companies' | 'mandates' | 'targets';

export const useLazyTabData = (tabType: CRMTabType) => {
  const leadsQuery = useLeads();
  const companiesQuery = useCompanies({ limit: 50 });
  const mandatesQuery = useBuyingMandates();

  // Only fetch data for the active tab
  switch (tabType) {
    case 'leads':
      return {
        data: leadsQuery.leads,
        isLoading: leadsQuery.isLoading,
        error: leadsQuery.error
      };
    
    case 'companies':
      return {
        data: companiesQuery.companies,
        isLoading: companiesQuery.isLoading,
        error: companiesQuery.error
      };
    
    case 'mandates':
      return {
        data: mandatesQuery.mandates,
        isLoading: mandatesQuery.isLoading,
        error: mandatesQuery.error ? new Error(mandatesQuery.error) : null
      };
    
    case 'targets':
      return {
        data: mandatesQuery.targets,
        isLoading: mandatesQuery.isLoading,
        error: mandatesQuery.error ? new Error(mandatesQuery.error) : null
      };
    
    default:
      return {
        data: [],
        isLoading: false,
        error: null
      };
  }
};