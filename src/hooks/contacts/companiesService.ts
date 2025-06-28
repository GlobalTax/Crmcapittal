
import { supabase } from '@/integrations/supabase/client';
import { ContactCompany } from '@/types/Contact';

export const fetchCompanies = async () => {
  const { data, error } = await supabase
    .from('contact_companies')
    .select('*')
    .order('company_name');

  if (!error && data) {
    const typedCompanies: ContactCompany[] = data.map(company => ({
      ...company,
      is_primary: company.is_primary ?? true
    }));
    return typedCompanies;
  }
  return [];
};
