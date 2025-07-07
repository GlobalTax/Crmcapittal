import { supabase } from '@/integrations/supabase/client';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus, LeadSource, LeadOrigin, LeadPriority, LeadQuality } from '@/types/Lead';
import { DatabaseService } from './databaseService';

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
      // Cast to the specific type that the database supports
      query = query.eq('status', filters.status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED');
    }
    // If the filter status is not supported by DB (like NURTURING, CONVERTED, LOST),
    // we don't apply the filter and let the frontend handle it
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
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', assignedUserIds);
    
    userProfiles = profiles || [];
  }

  // Transform the data to match our Lead interface with enhanced fields
  // Handle missing database columns gracefully
  const transformedData = (data || []).map(lead => ({
    ...lead,
    // Ensure source is properly typed
    source: (lead.source as LeadSource) || 'other',
    // Handle lead_origin field
    lead_origin: ((lead as { lead_origin?: string }).lead_origin as LeadOrigin) || 'manual',
    // Use actual database values or defaults for missing columns
    lead_score: (lead as { lead_score?: number }).lead_score || 0,
    priority: ((lead as { priority?: string }).priority as LeadPriority) || 'MEDIUM',
    quality: ((lead as { quality?: string }).quality as LeadQuality) || 'FAIR',
    follow_up_count: (lead as { follow_up_count?: number }).follow_up_count || 0,
    email_opens: (lead as { email_opens?: number }).email_opens || 0,
    email_clicks: (lead as { email_clicks?: number }).email_clicks || 0,
    website_visits: (lead as { website_visits?: number }).website_visits || 0,
    content_downloads: (lead as { content_downloads?: number }).content_downloads || 0,
    tags: (lead as { tags?: string[] }).tags || [],
    form_data: (lead as { form_data?: Record<string, unknown> }).form_data || {},
    job_title: (lead as { job_title?: string }).job_title || '',
    assigned_to: lead.assigned_to_id 
      ? userProfiles.find(profile => profile.id === lead.assigned_to_id) || null
      : null,
    lead_nurturing: []
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

  // Transform the data to match our Lead interface with missing column handling
  const transformedData = {
    ...data,
    source: (data.source as LeadSource) || 'other',
    lead_origin: ((data as { lead_origin?: string }).lead_origin as LeadOrigin) || 'manual',
    lead_score: (data as { lead_score?: number }).lead_score || 0,
    priority: ((data as { priority?: string }).priority as LeadPriority) || 'MEDIUM',
    quality: ((data as { quality?: string }).quality as LeadQuality) || 'FAIR',
    follow_up_count: (data as { follow_up_count?: number }).follow_up_count || 0,
    email_opens: (data as { email_opens?: number }).email_opens || 0,
    email_clicks: (data as { email_clicks?: number }).email_clicks || 0,
    website_visits: (data as { website_visits?: number }).website_visits || 0,
    content_downloads: (data as { content_downloads?: number }).content_downloads || 0,
    tags: (data as { tags?: string[] }).tags || [],
    form_data: (data as { form_data?: Record<string, unknown> }).form_data || {},
    job_title: (data as { job_title?: string }).job_title || '',
    assigned_to: assignedTo
  };

  console.log('Lead fetched successfully:', transformedData);
  return transformedData;
};

export const createLead = async (leadData: CreateLeadData): Promise<Lead> => {
  console.log('Creating lead:', leadData);

  // Prepare data for the current database schema (only use existing columns)
  const dataToInsert = {
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company_name: leadData.company_name,
    message: leadData.message,
    source: leadData.source,
    lead_origin: leadData.lead_origin || 'manual',
    status: 'NEW' as const
    // Note: other fields like priority, quality, lead_score, etc. are not included
    // because they don't exist in the current database schema
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
    lead_origin: (data.lead_origin as LeadOrigin) || 'manual',
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
    job_title: leadData.job_title || '',
    assigned_to: null
  };

  console.log('Lead created successfully:', transformedData);
  
  // Trigger automation after lead creation
  await triggerAutomation('lead_created', transformedData);
  
  return transformedData;
};

export const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead> => {
  console.log('Updating lead:', id, updates);

    // Only include fields that exist in the current database
    const dbUpdates: Partial<{
      name: string;
      email: string;
      phone: string;
      company_name: string;
      message: string;
      source: LeadSource;
      status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED';
      assigned_to_id: string;
    }> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.company_name !== undefined) dbUpdates.company_name = updates.company_name;
  if (updates.message !== undefined) dbUpdates.message = updates.message;
  if (updates.source !== undefined) dbUpdates.source = updates.source;
  // Only update status if it's supported by the database
  if (updates.status !== undefined && ['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED'].includes(updates.status)) {
    dbUpdates.status = updates.status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED';
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
    lead_origin: ((data as { lead_origin?: string }).lead_origin as LeadOrigin) || 'manual',
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
    job_title: updates.job_title || '',
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
): Promise<{ contactId: string; companyId?: string; dealId?: string }> => {
  console.log('Converting lead to contact:', leadId, options);

  // First get the lead data
  const lead = await fetchLeadById(leadId);
  if (!lead) {
    throw new Error('Lead not found');
  }

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
      lifecycle_stage: 'lead' as const
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

  // Always create deal when converting lead
  if (options.createDeal || true) { // Force creation for now
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

  // Update lead status to QUALIFIED (since CONVERTED isn't supported in DB)
  await updateLead(leadId, { status: 'QUALIFIED' });

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

// New automation trigger function - updated to use DatabaseService
export const triggerAutomation = async (triggerType: string, leadData: Lead) => {
  try {
    console.log('Triggering automation for:', triggerType, leadData.id);
    
    // Use DatabaseService to get automation rules
    const result = await DatabaseService.getAutomationRules();
    if (!result.success) {
      console.error('Failed to fetch automation rules:', result.error);
      return;
    }

    const rules = result.data || [];
    const matchingRules = rules.filter(rule => 
      rule.trigger_type === triggerType && rule.enabled
    );

    for (const rule of matchingRules) {
      try {
        const conditionsMet = evaluateConditions(rule.conditions, leadData);
        if (conditionsMet) {
          console.log('Executing automation rule:', rule.name);
          await executeActions(rule.actions, leadData);
        }
      } catch (error) {
        console.error('Error executing automation rule:', rule.name, error);
      }
    }
  } catch (error) {
    console.error('Error triggering automation:', error);
  }
};

interface AutomationCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'contains' | 'in';
  value: unknown;
}

interface AutomationAction {
  type: 'send_email' | 'create_task' | 'move_stage' | 'notify_user';
  config: Record<string, unknown>;
}

// Helper function to evaluate conditions
const evaluateConditions = (conditions: AutomationCondition[], leadData: Lead): boolean => {
  if (!conditions || conditions.length === 0) return true;
  
  return conditions.every(condition => {
    const fieldValue = leadData[condition.field];
    const expectedValue = condition.value;
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'greater_than':
        return Number(fieldValue) > Number(expectedValue);
      case 'contains':
        return Array.isArray(fieldValue) 
          ? fieldValue.includes(expectedValue)
          : String(fieldValue).includes(String(expectedValue));
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
      default:
        return false;
    }
  });
};

// Helper function to execute actions
const executeActions = async (actions: AutomationAction[], leadData: Lead) => {
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'send_email':
          await sendAutomatedEmail(leadData, action.config);
          break;
        case 'create_task':
          await createFollowUpTask(leadData, action.config);
          break;
        case 'move_stage':
          await updateLeadStatus(leadData.id, String(action.config.new_status));
          break;
        case 'notify_user':
          console.log('Notification:', action.config.message);
          break;
        default:
          console.log('Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('Error executing action:', action.type, error);
    }
  }
};

// Helper functions for actions
const sendAutomatedEmail = async (leadData: Lead, config: Record<string, unknown>) => {
  // Implementation would integrate with email service
  console.log('Sending automated email to:', leadData.email, config);
};

const createFollowUpTask = async (leadData: Lead, config: Record<string, unknown>) => {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (Number(config.due_days) || 1));
    
    await supabase.from('contact_reminders').insert({
      title: String(config.description) || 'Follow up with lead',
      description: `${config.description} - ${leadData.name} (${leadData.email})`,
      reminder_date: dueDate.toISOString(),
      contact_id: leadData.id,
      created_by: leadData.assigned_to_id
    });
  } catch (error) {
    console.error('Error creating follow-up task:', error);
  }
};

const updateLeadStatus = async (leadId: string, newStatus: string) => {
  try {
    // Only update status if it's supported by the database
    const supportedStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED'];
    if (supportedStatuses.includes(newStatus)) {
      await supabase
        .from('leads')
        .update({ status: newStatus as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISQUALIFIED' })
        .eq('id', leadId);
    }
  } catch (error) {
    console.error('Error updating lead status:', error);
  }
};
