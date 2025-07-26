import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/Contact';

interface UseContactsFilteredOptions {
  search?: string;
  companyId?: string;
  limit?: number;
}

export const useContactsFiltered = (options: UseContactsFilteredOptions = {}) => {
  const { search = '', companyId, limit = 50 } = options;

  return useQuery({
    queryKey: ['contacts-filtered', search, companyId, limit],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('contact_status', 'active')
        .order('name', { ascending: true });

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,position.ilike.%${search}%`);
      }

      // Apply company filter - show company contacts OR all leads
      if (companyId) {
        query = query.or(`company_id.eq.${companyId},contact_type.eq.lead`);
      }

      // Apply limit
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered contacts:', error);
        throw error;
      }

      return data as Contact[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};