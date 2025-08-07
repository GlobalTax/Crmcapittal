import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadEmail {
  id: string;
  lead_id: string;
  to_email: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'failed';
  sent_at?: string;
  open_count: number;
  last_open_at?: string;
  created_at: string;
}

export const useLeadEmails = (leadId?: string) => {
  return useQuery({
    queryKey: ['lead_emails', leadId],
    enabled: !!leadId,
    queryFn: async (): Promise<LeadEmail[]> => {
      const { data, error } = await supabase
        .from('lead_emails')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as LeadEmail[];
    },
    staleTime: 60_000,
  });
};
