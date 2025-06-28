
import { supabase } from '@/integrations/supabase/client';

export const insertOperation = async (operationData: any, userId: string) => {
  console.log('Añadiendo operación con datos:', operationData);
  console.log('Usuario actual:', userId);

  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  const insertData = {
    company_name: operationData.company_name,
    project_name: operationData.project_name || null,
    cif: operationData.cif || null,
    sector: operationData.sector,
    operation_type: operationData.operation_type,
    amount: operationData.amount,
    revenue: operationData.revenue || null,
    ebitda: operationData.ebitda || null,
    currency: operationData.currency,
    date: operationData.date,
    buyer: operationData.buyer || null,
    seller: operationData.seller || null,
    status: operationData.status,
    description: operationData.description || null,
    location: operationData.location || null,
    contact_email: operationData.contact_email || null,
    contact_phone: operationData.contact_phone || null,
    annual_growth_rate: operationData.annual_growth_rate || null,
    created_by: userId
  };

  console.log('Datos preparados para inserción:', insertData);

  const { data, error } = await supabase
    .from('operations')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error de Supabase:', error);
    throw error;
  }

  console.log('Operación creada exitosamente:', data);
  return data;
};

export const insertBulkOperations = async (operationsData: any[], userId: string) => {
  console.log('Añadiendo operaciones masivas:', operationsData.length, 'operaciones');
  console.log('Usuario actual:', userId);

  // Para operaciones públicas de ejemplo, permitir userId = 'public'
  if (!userId && userId !== 'public') {
    throw new Error('Usuario no autenticado');
  }

  const insertData = operationsData.map(operationData => ({
    company_name: operationData.company_name,
    project_name: operationData.project_name || null,
    cif: operationData.cif || null,
    sector: operationData.sector,
    operation_type: operationData.operation_type,
    amount: operationData.amount,
    revenue: operationData.revenue || null,
    ebitda: operationData.ebitda || null,
    currency: operationData.currency || 'EUR',
    date: operationData.date,
    buyer: operationData.buyer || null,
    seller: operationData.seller || null,
    status: operationData.status || 'available',
    description: operationData.description || null,
    location: operationData.location || null,
    contact_email: operationData.contact_email || null,
    contact_phone: operationData.contact_phone || null,
    annual_growth_rate: operationData.annual_growth_rate || null,
    // Para operaciones de ejemplo públicas, no asignar created_by
    created_by: userId === 'public' ? null : userId
  }));

  console.log('Datos preparados para inserción masiva:', insertData);

  const { data, error } = await supabase
    .from('operations')
    .insert(insertData)
    .select();

  if (error) {
    console.error('Error de Supabase en inserción masiva:', error);
    throw error;
  }

  console.log('Operaciones creadas exitosamente:', data?.length, 'operaciones');
  return data;
};
