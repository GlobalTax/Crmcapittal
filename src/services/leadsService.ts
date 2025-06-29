import { supabase } from '@/integrations/supabase/client';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus, LeadSource } from '@/types/Lead';

export const fetchLeads = async (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}): Promise<Lead[]> => {
  console.log('Fetching leads with filters:', filters);
  
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  // Only filter by status if it's one of the database-supported statuses
  // Database only supports: NEW, CONTACTED, QUALIFIED, DISQUALIFIED
  if (filters?.status) {
    const dbSupportedStatuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED'];
    if (dbSupportedStatuses.includes(filters.status)) {
      query = query.eq('status', filters.status);
    }
  }

  if (filters?.assigned_to_id) {
    query = query.eq('assigned_to_id', filters.assigned_to_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }

  // Fetch user profiles for assigned users
  const assignedUserIds = (data || [])
    .map(lead => lead.assigned_to_id)
    .filter(Boolean);

  let userProfiles: any[] = [];
  if (assignedUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', assignedUserIds);
    
    userProfiles = profiles || [];
  }

  // Transform the data to match our Lead interface
  const transformedData = (data || []).map(lead => ({
    ...lead,
    // Ensure source is properly typed
    source: (lead.source as LeadSource) || 'other',
    // Set default values for new fields to maintain compatibility
    lead_score: 0, // Default since this field doesn't exist in DB yet
    priority: 'MEDIUM' as const,
    quality: 'FAIR' as const,
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: [],
    form_data: {},
    assigned_to: lead.assigned_to_id 
      ? userProfiles.find(profile => profile.id === lead.assigned_to_id) || null
      : null
  }));

  console.log('Leads fetched successfully:', transformedData?.length);
  return transformedData;
};

export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  console.log('Fetching lead by ID:', id);
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }

  // Fetch user profile if assigned
  let assignedTo = null;
  if (data.assigned_to_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('id', data.assigned_to_id)
      .single();
    
    assignedTo = profile;
  }

  // Transform the data to match our Lead interface
  const transformedData = {
    ...data,
    source: (data.source as LeadSource) || 'other',
    lead_score: 0, // Default since this field doesn't exist in DB yet
    priority: 'MEDIUM' as const,
    quality: 'FAIR' as const,
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: [],
    form_data: {},
    assigned_to: assignedTo
  };

  console.log('Lead fetched successfully:', transformedData);
  return transformedData;
};

export const createLead = async (leadData: CreateLeadData): Promise<Lead> => {
  console.log('Creating lead:', leadData);

  // Prepare data for the current database schema
  const dataToInsert = {
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company_name: leadData.company_name,
    message: leadData.message,
    source: leadData.source,
    status: 'NEW' as const // Default status
  };

  const { data, error } = await supabase
    .from('leads')
    .insert([dataToInsert])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  // Transform the data to match our Lead interface
  const transformedData = {
    ...data,
    source: (data.source as LeadSource) || 'other',
    lead_score: leadData.lead_score || 10,
    priority: leadData.priority || 'MEDIUM',
    quality: leadData.quality || 'FAIR',
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: leadData.tags || [],
    form_data: leadData.form_data || {},
    assigned_to: null
  };

  console.log('Lead created successfully:', transformedData);
  return transformedData;
};

export const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead> => {
  console.log('Updating lead:', id, updates);

  // Only include fields that exist in the database
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.company_name !== undefined) dbUpdates.company_name = updates.company_name;
  if (updates.message !== undefined) dbUpdates.message = updates.message;
  if (updates.source !== undefined) dbUpdates.source = updates.source;
  // Only update status if it's supported by the database
  if (updates.status !== undefined && ['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED'].includes(updates.status)) {
    dbUpdates.status = updates.status;
  }
  if (updates.assigned_to_id !== undefined) dbUpdates.assigned_to_id = updates.assigned_to_id;

  const { data, error } = await supabase
    .from('leads')
    .update(dbUpdates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    throw error;
  }

  // Fetch user profile if assigned
  let assignedTo = null;
  if (data.assigned_to_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('id', data.assigned_to_id)
      .single();
    
    assignedTo = profile;
  }

  // Transform the data to match our Lead interface
  const transformedData = {
    ...data,
    source: (data.source as LeadSource) || 'other',
    lead_score: updates.lead_score || 0,
    priority: updates.priority || 'MEDIUM',
    quality: updates.quality || 'FAIR',
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: updates.tags || [],
    form_data: updates.form_data || {},
    assigned_to: assignedTo
  };

  console.log('Lead updated successfully:', transformedData);
  return transformedData;
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
  options: { createCompany: boolean; createDeal: boolean; }
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

  // Update lead status to QUALIFIED (since CONVERTED isn't supported in DB)
  await updateLead(leadId, { status: 'QUALIFIED' });

  console.log('Lead converted successfully to contact:', contact.id);
  return { contactId: contact.id };
};
