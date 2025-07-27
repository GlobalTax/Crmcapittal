import { supabase, createAuthenticatedQuery } from '@/integrations/supabase/client';
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus, LeadStage } from '@/types/Lead';
import { logger } from '@/utils/logger';

// Database compatible LeadStatus values
type DbLeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED";

// Map our LeadStatus to database compatible values
const mapStatusToDb = (status: LeadStatus): DbLeadStatus => {
  switch (status) {
    case 'NEW':
    case 'CONTACTED':
    case 'QUALIFIED':
    case 'DISQUALIFIED':
      return status;
    case 'NURTURING':
      return 'CONTACTED'; // Map NURTURING to CONTACTED for DB compatibility
    case 'CONVERTED':
      return 'QUALIFIED'; // Map CONVERTED to QUALIFIED for DB compatibility
    case 'LOST':
      return 'DISQUALIFIED'; // Map LOST to DISQUALIFIED for DB compatibility
    default:
      return 'NEW';
  }
};

// Map database status back to our LeadStatus
const mapStatusFromDb = (status: string): LeadStatus => {
  return status as LeadStatus;
};

export const fetchLeads = async (filters?: {
  status?: LeadStatus;
  stage?: LeadStage;
  sector_id?: string;
  owner_id?: string;
}): Promise<Lead[]> => {
  try {
    // Use authenticated query wrapper
    const result = await createAuthenticatedQuery(async () => {
      let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

      // Apply filters without complex type constraints
      if (filters?.status) {
        const dbStatus = mapStatusToDb(filters.status);
        query = (query as any).eq('status', dbStatus);
      }

      if (filters?.stage) {
        query = (query as any).eq('stage', filters.stage);
      }

      if (filters?.sector_id) {
        query = (query as any).eq('sector_id', filters.sector_id);
      }

      if (filters?.owner_id) {
        query = (query as any).eq('owner_id', filters.owner_id);
      }

      return await query;
    });

    if (result.error) {
      logger.error('Error fetching leads:', result.error);
      throw result.error;
    }

    const data = result.data || [];
    return data.map((lead: any) => ({
      ...lead,
      status: mapStatusFromDb(lead.status || 'NEW'),
      stage: lead.stage || 'pipeline',
      assigned_to: null // Keep for compatibility
    })) as Lead[];
  } catch (error) {
    logger.error('Error in fetchLeads:', error);
    throw error;
  }
};

export const fetchLeadById = async (id: string): Promise<Lead> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching lead by id:', error);
      throw error;
    }

    return {
      ...data,
      status: mapStatusFromDb((data as any).status || 'NEW'),
      stage: (data as any).stage || 'pipeline',
      assigned_to: null // Keep for compatibility
    } as Lead;
  } catch (error) {
    logger.error('Error in fetchLeadById:', error);
    throw error;
  }
};

export const createLead = async (leadData: CreateLeadData): Promise<Lead> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const dbLeadData = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      company_name: leadData.company || leadData.company_name,
      job_title: leadData.position || leadData.job_title,
      message: leadData.message,
      source: leadData.source,
      lead_origin: leadData.lead_origin || 'manual',
      service_type: leadData.service_type || 'mandato_venta',
      status: mapStatusToDb(leadData.status || 'NEW'),
      priority: leadData.priority || 'MEDIUM',
      quality: leadData.quality || 'FAIR',
      lead_score: leadData.lead_score || 0,
      tags: leadData.tags || [],
      created_by: user.id,
      assigned_to_id: user.id,
      
      // New fields
      valor_estimado: leadData.valor_estimado || 0,
      stage: leadData.stage || 'pipeline',
      prob_conversion: leadData.prob_conversion || 0,
      source_detail: leadData.source_detail,
      sector_id: leadData.sector_id,
      owner_id: leadData.owner_id || user.id,
      last_contacted: leadData.last_contacted,
      next_action_date: leadData.next_action_date,
      aipersona: leadData.aipersona || {},
      extra: leadData.extra || {},
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(dbLeadData)
      .select('*')
      .single();

    if (error) {
      logger.error('Error creating lead:', error);
      throw error;
    }

    return {
      ...data,
      status: mapStatusFromDb((data as any).status || 'NEW'),
      stage: (data as any).stage || 'pipeline'
    } as Lead;
  } catch (error) {
    logger.error('Error in createLead:', error);
    throw error;
  }
};

export const updateLead = async (id: string, updates: UpdateLeadData): Promise<Lead> => {
  try {
    const dbUpdates: any = { ...updates };
    
    // Map status to database compatible value
    if (updates.status) {
      dbUpdates.status = mapStatusToDb(updates.status);
    }

    // Handle legacy field mappings
    if (updates.company) {
      dbUpdates.company_name = updates.company;
      delete dbUpdates.company;
    }
    if (updates.position) {
      dbUpdates.job_title = updates.position;
      delete dbUpdates.position;
    }

    const { data, error } = await supabase
      .from('leads')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logger.error('Error updating lead:', error);
      throw error;
    }

    return {
      ...data,
      status: mapStatusFromDb((data as any).status || 'NEW'),
      stage: (data as any).stage || 'pipeline'
    } as Lead;
  } catch (error) {
    logger.error('Error in updateLead:', error);
    throw error;
  }
};

export const deleteLead = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting lead:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Error in deleteLead:', error);
    throw error;
  }
};

export const convertLeadToContact = async (
  leadId: string,
  options: { createCompany: boolean; createDeal: boolean }
): Promise<{ contactId: string; companyId?: string; dealId?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Get lead data
    const lead = await fetchLeadById(leadId);

    // Create contact
    const contactData = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company_name,
      position: lead.job_title,
      contact_type: 'cliente',
      lifecycle_stage: 'marketing_qualified_lead',
      lead_score: lead.lead_score || 0,
      lead_source: lead.source,
      notes: lead.message,
      created_by: user.id,
    };

    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single();

    if (contactError) {
      throw contactError;
    }

    let companyId: string | undefined;
    let dealId: string | undefined;

    // Create company if requested and company name exists
    if (options.createCompany && lead.company_name) {
      const companyData = {
        name: lead.company_name,
        website: `https://${lead.company_name.toLowerCase().replace(/\s+/g, '')}.com`,
        sector: 'No especificado',
        created_by: user.id,
      };

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (!companyError && company) {
        companyId = company.id;
        
        // Update contact with company reference
        await supabase
          .from('contacts')
          .update({ company_id: companyId })
          .eq('id', contact.id);
      }
    }

    // Create deal if requested
    if (options.createDeal) {
      const dealData = {
        deal_name: `Oportunidad - ${lead.name}`,
        description: lead.message || 'Oportunidad creada desde lead',
        contact_id: contact.id,
        company_id: companyId,
        stage: 'initial_contact',
        amount: lead.valor_estimado || 0,
        probability: lead.prob_conversion || 25,
        created_by: user.id,
      };

      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert(dealData)
        .select()
        .single();

      if (!dealError && deal) {
        dealId = deal.id;
      }
    }

    // Mark lead as converted
    await updateLead(leadId, {
      status: 'CONVERTED',
      stage: 'ganado',
      converted_to_contact_id: contact.id,
      converted_to_deal_id: dealId,
    });

    return {
      contactId: contact.id,
      companyId,
      dealId,
    };
  } catch (error) {
    logger.error('Error in convertLeadToContact:', error);
    throw error;
  }
};

export const bulkInsertLeads = async (leads: CreateLeadData[]): Promise<Lead[]> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Usuario no autenticado');
    }

    const dbLeadsData = leads.map(leadData => ({
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || '',
      company_name: leadData.company || leadData.company_name || '',
      job_title: leadData.position || leadData.job_title || '',
      source: leadData.source,
      status: mapStatusToDb(leadData.status || 'NEW'),
      lead_score: leadData.lead_score || 0,
      lead_origin: leadData.lead_origin || 'manual',
      service_type: leadData.service_type || 'mandato_venta',
      message: leadData.message || '',
      tags: leadData.tags || [],
      created_by: user.id,
      assigned_to_id: user.id,
      
      // New fields
      valor_estimado: leadData.valor_estimado || 0,
      stage: leadData.stage || 'pipeline',
      prob_conversion: leadData.prob_conversion || 0,
      source_detail: leadData.source_detail,
      sector_id: leadData.sector_id,
      owner_id: leadData.owner_id || user.id,
      aipersona: leadData.aipersona || {},
      extra: leadData.extra || {},
    }));

    const { data, error } = await supabase
      .from('leads')
      .insert(dbLeadsData)
      .select('*');

    if (error) {
      logger.error('Error bulk inserting leads:', error);
      throw error;
    }

    return (data || []).map((lead: any) => ({
      ...lead,
      status: mapStatusFromDb(lead.status || 'NEW'),
      stage: lead.stage || 'pipeline'
    })) as Lead[];
  } catch (error) {
    logger.error('Error in bulkInsertLeads:', error);
    throw error;
  }
};