import { Lead, LeadStatus, CreateLeadData } from '@/types/Lead';

// Database compatible LeadStatus values
type DbLeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED";

/**
 * Maps our LeadStatus to database compatible values
 */
export const mapStatusToDb = (status: LeadStatus): DbLeadStatus => {
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

/**
 * Maps database status back to our LeadStatus
 */
export const mapStatusFromDb = (status: string): LeadStatus => {
  return status as LeadStatus;
};

/**
 * Maps CreateLeadData to database insert format
 */
export const mapLeadDataToDb = (leadData: CreateLeadData, userId: string): Record<string, any> => {
  return {
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
    created_by: userId,
    assigned_to_id: userId,
    
    // New fields
    valor_estimado: leadData.valor_estimado || 0,
    stage: leadData.stage || 'pipeline',
    prob_conversion: leadData.prob_conversion || 0,
    source_detail: leadData.source_detail,
    sector_id: leadData.sector_id,
    owner_id: leadData.owner_id || userId,
    last_contacted: leadData.last_contacted,
    next_action_date: leadData.next_action_date,
    aipersona: leadData.aipersona || {},
    extra: leadData.extra || {},
  };
};

/**
 * Maps database lead to Lead type
 */
export const mapDbToLead = (dbLead: any): Lead => {
  return {
    ...dbLead,
    status: mapStatusFromDb(dbLead.status || 'NEW'),
    stage: dbLead.stage || 'pipeline',
    assigned_to: null // Keep for compatibility
  } as Lead;
};

/**
 * Maps Lead updates to database format
 */
export const mapLeadUpdatesToDb = (updates: any): Record<string, any> => {
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

  return dbUpdates;
};