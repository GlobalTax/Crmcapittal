import { supabase } from '@/integrations/supabase/client';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus, LeadSource, LeadOrigin, LeadPriority, LeadQuality } from '@/types/Lead';

export const fetchLeads = async (filters?: {
  status?: LeadStatus;
  assigned_to_id?: string;
}): Promise<Lead[]> => {
  // Fetch from dedicated leads table
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status) {
    // Only filter by valid database status values
    const validDbStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED'] as const;
    type DbLeadStatus = typeof validDbStatuses[number];
    
    if (validDbStatuses.includes(filters.status as DbLeadStatus)) {
      query = query.eq('status', filters.status as DbLeadStatus);
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

  let userProfiles: Array<{ id: string; first_name?: string; last_name?: string }> = [];
  if (assignedUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', assignedUserIds);
    
    if (!profilesError && profiles) {
      userProfiles = profiles;
    }
  }

  // Transform the data to match our Lead interface
  const transformedData = (data || []).map(lead => ({
    ...lead,
    // Ensure proper types
    source: lead.source as LeadSource,
    status: lead.status as LeadStatus,
    lead_origin: lead.lead_origin as LeadOrigin,
    priority: lead.priority as LeadPriority,
    quality: lead.quality as LeadQuality,
    // Add fields that don't exist in leads table yet, with default values
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: lead.tags || [],
    form_data: {},
    assigned_to: lead.assigned_to_id 
      ? userProfiles.find(profile => profile.id === lead.assigned_to_id) || null
      : null,
    lead_nurturing: []
  }));

  return transformedData;
};

export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  console.log('Fetching lead by ID:', id);
  
  // Fetch from the dedicated leads table
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  // Fetch user profile if assigned
  let assignedTo = null;
  if (data.assigned_to_id) {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('id', data.assigned_to_id)
      .maybeSingle();
    
    if (!profileError && profile) {
      assignedTo = profile;
    }
  }

  // Transform the data to match our Lead interface 
  const transformedData = {
    ...data,
    // Ensure proper types
    source: data.source as LeadSource,
    status: data.status as LeadStatus,
    lead_origin: data.lead_origin as LeadOrigin,
    priority: data.priority as LeadPriority,
    quality: data.quality as LeadQuality,
    // Add fields that don't exist in leads table yet, with default values
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: data.tags || [],
    form_data: {},
    assigned_to: assignedTo
  };

  console.log('Lead fetched successfully:', transformedData);
  return transformedData;
};

export const createLead = async (leadData: CreateLeadData): Promise<Lead> => {
  console.log('Creating lead:', leadData);

  // Create in dedicated leads table
  const leadInsertData = {
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company_name: leadData.company_name,
    job_title: leadData.job_title,
    source: leadData.source,
    status: 'NEW' as const,
    lead_score: leadData.lead_score || 0,
    lead_origin: leadData.lead_origin || 'manual',
    message: leadData.message,
    tags: leadData.tags || []
  };

  const { data, error } = await supabase
    .from('leads')
    .insert([leadInsertData])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  // Transform the data to match our Lead interface
  const transformedData = {
    ...data,
    // Ensure proper types
    source: data.source as LeadSource,
    status: data.status as LeadStatus,
    lead_origin: data.lead_origin as LeadOrigin,
    priority: data.priority as LeadPriority,
    quality: data.quality as LeadQuality,
    // Add fields that don't exist in leads table yet
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: data.tags || [],
    form_data: leadData.form_data || {},
    assigned_to: null
  };

  console.log('Lead created successfully:', transformedData);
  return transformedData;
};

export const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead> => {
  console.log('Updating lead:', id, updates);

  // Update in dedicated leads table - filter compatible fields
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.email) updateData.email = updates.email;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.company_name) updateData.company_name = updates.company_name;
  if (updates.job_title) updateData.job_title = updates.job_title;
  if (updates.source) updateData.source = updates.source;
  if (updates.status) updateData.status = updates.status;
  if (updates.priority) updateData.priority = updates.priority;
  if (updates.quality) updateData.quality = updates.quality;
  if (updates.lead_score !== undefined) updateData.lead_score = updates.lead_score;
  if (updates.assigned_to_id) updateData.assigned_to_id = updates.assigned_to_id;
  if (updates.tags) updateData.tags = updates.tags;

  const { data, error } = await supabase
    .from('leads')
    .update(updateData)
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
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('id', data.assigned_to_id)
      .maybeSingle();
    
    if (!profileError && profile) {
      assignedTo = profile;
    }
  }

  // Transform the data to match our Lead interface
  const transformedData = {
    ...data,
    // Ensure proper types
    source: data.source as LeadSource,
    status: data.status as LeadStatus,
    lead_origin: data.lead_origin as LeadOrigin,
    priority: data.priority as LeadPriority,
    quality: data.quality as LeadQuality,
    // Add fields that don't exist in leads table yet
    follow_up_count: 0,
    email_opens: 0,
    email_clicks: 0,
    website_visits: 0,
    content_downloads: 0,
    tags: data.tags || [],
    form_data: {},
    assigned_to: assignedTo
  };

  console.log('Lead updated successfully:', transformedData);
  return transformedData;
};

export const deleteLead = async (id: string): Promise<void> => {
  console.log('Deleting lead:', id);

  // Delete from dedicated leads table
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
): Promise<{ contactId: string; companyId?: string; dealId?: string }> => {
  console.log('Converting lead to contact:', leadId, options);

  // First get the lead data from leads table
  const { data: leadData, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId);

  if (leadError || !leadData || leadData.length === 0) {
    throw new Error('Lead not found');
  }

  const lead = leadData[0];

  // Get current user ID
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  let companyId: string | undefined;

  // Create company if requested and company_name exists
  if (options.createCompany && lead.company_name) {
    const companyData = {
      name: lead.company_name,
      created_by: user.id,
      company_type: 'prospect' as const,
      company_status: 'prospecto' as const,
      lifecycle_stage: 'customer' as const
    };

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();

    if (companyError) {
      console.warn('Error creating company:', companyError);
    } else {
      companyId = company.id;
    }
  }

  // Create contact
  const contactData = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company_name,
    company_id: companyId,
    contact_type: 'prospect',
    contact_source: lead.source,
    notes: lead.message,
    lifecycle_stage: 'customer',
    created_by: user.id
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

  let dealId: string | undefined;

  // Create deal if requested
  if (options.createDeal) {
    const dealData = {
      deal_name: `Oportunidad - ${lead.name}`,
      company_name: lead.company_name,
      contact_name: lead.name,
      contact_email: lead.email,
      contact_phone: lead.phone,
      contact_id: contact.id,
      lead_source: lead.source,
      deal_type: 'venta',
      priority: 'media',
      description: lead.message,
      created_by: user.id
    };

    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert([dealData])
      .select()
      .single();

    if (dealError) {
      console.error('Error creating deal:', dealError);
    } else {
      dealId = deal.id;
    }
  }

  // Delete the lead from leads table after conversion
  await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  console.log('Lead converted successfully:', { 
    contactId: contact.id, 
    companyId, 
    dealId 
  });
  
  return { 
    contactId: contact.id, 
    companyId, 
    dealId 
  };
};

// Export placeholder for missing function
export const triggerAutomation = (event?: string, data?: any) => {
  console.log('Automation triggered:', event, data);
};