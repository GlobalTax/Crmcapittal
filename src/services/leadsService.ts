
import { supabase } from '@/integrations/supabase/client';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus } from '@/types/Lead';

export const fetchLeads = async (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}): Promise<Lead[]> => {
  console.log('Fetching leads with filters:', filters);
  
  let query = supabase
    .from('leads')
    .select(`
      *,
      assigned_to:user_profiles(
        id,
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.assigned_to_id) {
    query = query.eq('assigned_to_id', filters.assigned_to_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }

  console.log('Leads fetched successfully:', data?.length);
  return data || [];
};

export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  console.log('Fetching lead by ID:', id);
  
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      assigned_to:user_profiles(
        id,
        first_name,
        last_name
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }

  console.log('Lead fetched successfully:', data);
  return data;
};

export const createLead = async (leadData: CreateLeadData): Promise<Lead> => {
  console.log('Creating lead:', leadData);

  const { data, error } = await supabase
    .from('leads')
    .insert([leadData])
    .select(`
      *,
      assigned_to:user_profiles(
        id,
        first_name,
        last_name
      )
    `)
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  console.log('Lead created successfully:', data);
  return data;
};

export const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead> => {
  console.log('Updating lead:', id, updates);

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      assigned_to:user_profiles(
        id,
        first_name,
        last_name
      )
    `)
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    throw error;
  }

  console.log('Lead updated successfully:', data);
  return data;
};

export const deleteLead = async (id: string): Promise<void> => {
  console.log('Deleting lead:', id);

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }

  console.log('Lead deleted successfully');
};

export const convertLeadToContact = async (
  leadId: string,
  options: {
    createCompany: boolean;
    createDeal: boolean;
  }
): Promise<{ contactId: string }> => {
  console.log('Converting lead to contact:', leadId, options);

  // First get the lead data
  const lead = await fetchLeadById(leadId);
  if (!lead) {
    throw new Error('Lead not found');
  }

  // Create contact
  const contactData = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company_name,
    contact_type: 'prospect',
    contact_source: lead.source,
    notes: lead.message
  };

  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .insert([contactData])
    .select()
    .single();

  if (contactError) {
    console.error('Error creating contact:', contactError);
    throw contactError;
  }

  // Update lead status to QUALIFIED
  await updateLead(leadId, { status: 'QUALIFIED' });

  console.log('Lead converted successfully to contact:', contact.id);
  return { contactId: contact.id };
};
