import { supabase } from '@/integrations/supabase/client';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus } from '@/types/Lead';

export const fetchLeads = async (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}): Promise<Lead[]> => {
  console.log('Fetching leads with filters:', filters);
  
  let query = supabase
    .from('leads')
    .select('*')
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
    // Set default values for new fields to maintain compatibility
    lead_score: lead.lead_score || 0,
    priority: lead.priority || 'MEDIUM',
    quality: lead.quality || 'FAIR',
    follow_up_count: lead.follow_up_count || 0,
    email_opens: lead.email_opens || 0,
    email_clicks: lead.email_clicks || 0,
    website_visits: lead.website_visits || 0,
    content_downloads: lead.content_downloads || 0,
    tags: lead.tags || [],
    form_data: lead.form_data || {},
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
    // Set default values for new fields to maintain compatibility
    lead_score: data.lead_score || 0,
    priority: data.priority || 'MEDIUM',
    quality: data.quality || 'FAIR',
    follow_up_count: data.follow_up_count || 0,
    email_opens: data.email_opens || 0,
    email_clicks: data.email_clicks || 0,
    website_visits: data.website_visits || 0,
    content_downloads: data.content_downloads || 0,
    tags: data.tags || [],
    form_data: data.form_data || {},
    assigned_to: assignedTo
  };

  console.log('Lead fetched successfully:', transformedData);
  return transformedData;
};

export const createLead = async (leadData: CreateLeadData): Promise<Lead> => {
  console.log('Creating lead:', leadData);

  // Prepare data with defaults
  const dataToInsert = {
    ...leadData,
    lead_score: leadData.lead_score || 10, // Default initial score
    priority: leadData.priority || 'MEDIUM',
    quality: leadData.quality || 'FAIR',
    tags: leadData.tags || [],
    form_data: leadData.form_data || {}
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
    lead_score: data.lead_score || 0,
    priority: data.priority || 'MEDIUM',
    quality: data.quality || 'FAIR',
    follow_up_count: data.follow_up_count || 0,
    email_opens: data.email_opens || 0,
    email_clicks: data.email_clicks || 0,
    website_visits: data.website_visits || 0,
    content_downloads: data.content_downloads || 0,
    tags: data.tags || [],
    form_data: data.form_data || {},
    assigned_to: assignedTo
  };

  console.log('Lead created successfully:', transformedData);
  return transformedData;
};

export const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead> => {
  console.log('Updating lead:', id, updates);

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
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
    lead_score: data.lead_score || 0,
    priority: data.priority || 'MEDIUM',
    quality: data.quality || 'FAIR',
    follow_up_count: data.follow_up_count || 0,
    email_opens: data.email_opens || 0,
    email_clicks: data.email_clicks || 0,
    website_visits: data.website_visits || 0,
    content_downloads: data.content_downloads || 0,
    tags: data.tags || [],
    form_data: data.form_data || {},
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
