import { Operation } from '@/types/Operation';

/**
 * Maps database operation to Operation type
 */
export const mapDbToOperation = (dbOperation: any): Operation => {
  return {
    id: dbOperation.id,
    company_name: dbOperation.company_name || '',
    project_name: dbOperation.project_name,
    sector: dbOperation.sector || '',
    operation_type: dbOperation.operation_type || 'sale',
    amount: dbOperation.amount || 0,
    currency: dbOperation.currency || 'EUR',
    date: dbOperation.date || dbOperation.created_at,
    buyer: dbOperation.buyer,
    seller: dbOperation.seller,
    status: dbOperation.status || 'available',
    description: dbOperation.description || '',
    location: dbOperation.location || '',
    contact_email: dbOperation.contact_email,
    contact_phone: dbOperation.contact_phone,
    revenue: dbOperation.revenue,
    ebitda: dbOperation.ebitda,
    annual_growth_rate: dbOperation.annual_growth_rate,
    manager_id: dbOperation.manager_id,
    manager: dbOperation.manager,
    created_by: dbOperation.created_by,
    created_at: dbOperation.created_at,
    updated_at: dbOperation.updated_at,
    cif: dbOperation.cif,
    teaser_url: dbOperation.teaser_url,
    highlighted: dbOperation.highlighted || false,
    rod_order: dbOperation.rod_order,
  };
};

/**
 * Maps Operation to database insert format
 */
export const mapOperationToDb = (operation: Partial<Operation>, userId: string): Record<string, any> => {
  return {
    company_name: operation.company_name,
    project_name: operation.project_name,
    sector: operation.sector,
    operation_type: operation.operation_type,
    amount: operation.amount,
    currency: operation.currency || 'EUR',
    date: operation.date,
    buyer: operation.buyer,
    seller: operation.seller,
    status: operation.status || 'available',
    description: operation.description,
    location: operation.location,
    contact_email: operation.contact_email,
    contact_phone: operation.contact_phone,
    revenue: operation.revenue,
    ebitda: operation.ebitda,
    annual_growth_rate: operation.annual_growth_rate,
    manager_id: operation.manager_id,
    created_by: userId,
    cif: operation.cif,
    teaser_url: operation.teaser_url,
    highlighted: operation.highlighted || false,
    rod_order: operation.rod_order,
  };
};