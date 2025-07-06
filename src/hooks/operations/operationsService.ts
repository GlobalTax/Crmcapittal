
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '@/types/Operation';
import { CreateOperationData, BulkOperationData } from '@/types/OperationData';

export const fetchOperationsFromDB = async (role?: string): Promise<Operation[]> => {
  console.log('Iniciando consulta optimizada de operaciones con join de managers...');
  
  let query = supabase
    .from('operations')
    .select(`
      *,
      operation_managers!manager_id(
        id,
        name,
        email,
        phone,
        position,
        photo
      )
    `)
    .order('created_at', { ascending: false });

  // Si el usuario no es admin, solo mostrar operaciones disponibles
  if (role !== 'admin' && role !== 'superadmin') {
    query = query.eq('status', 'available');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error en la consulta:', error);
    throw error;
  }

  console.log('Datos obtenidos de la consulta:', data?.length, 'operaciones');

  // Procesar y mapear los datos de manera optimizada
  const typedOperations: Operation[] = (data || []).map(op => {
    console.log('Procesando operación:', op.company_name);
    
    // Manejar el caso donde operation_managers puede ser null o undefined
    let managerData = undefined;
    if (op.operation_managers && typeof op.operation_managers === 'object' && op.operation_managers.id) {
      managerData = {
        id: op.operation_managers.id,
        name: op.operation_managers.name,
        email: op.operation_managers.email,
        phone: op.operation_managers.phone,
        position: op.operation_managers.position,
        photo: op.operation_managers.photo
      };
    }
    
    return {
      ...op,
      operation_type: op.operation_type as Operation['operation_type'],
      status: op.status as Operation['status'],
      manager: managerData
    };
  });

  console.log('Operaciones procesadas exitosamente:', typedOperations.length);
  return typedOperations;
};

export const insertOperation = async (operationData: CreateOperationData, userId: string) => {
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

export const insertBulkOperations = async (operationsData: BulkOperationData[], userId: string) => {
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

export const updateOperationInDB = async (operationId: string, operationData: Partial<Operation>) => {
  const { data, error } = await supabase
    .from('operations')
    .update({ 
      ...operationData,
      updated_at: new Date().toISOString() 
    })
    .eq('id', operationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateOperationStatusInDB = async (operationId: string, newStatus: Operation['status']) => {
  const { data, error } = await supabase
    .from('operations')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', operationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteOperationFromDB = async (operationId: string, userRole?: string) => {
  console.log('Intentando eliminar operación:', operationId, 'con rol:', userRole);
  
  // Si es admin o superadmin, permitir eliminar cualquier operación
  if (userRole === 'admin' || userRole === 'superadmin') {
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', operationId);

    if (error) {
      console.error('Error eliminando operación como admin:', error);
      throw error;
    }
    
    console.log('Operación eliminada exitosamente por admin');
    return;
  }

  // Para usuarios normales, solo eliminar si son el creador
  const { error } = await supabase
    .from('operations')
    .delete()
    .eq('id', operationId)
    .eq('created_by', (await supabase.auth.getUser()).data.user?.id);

  if (error) {
    console.error('Error eliminando operación como usuario:', error);
    throw error;
  }
  
  console.log('Operación eliminada exitosamente por usuario');
};

export const updateTeaserUrlInDB = async (operationId: string, teaserUrl: string | null) => {
  console.log('Actualizando teaser_url para operación:', operationId, 'nueva URL:', teaserUrl);
  
  const { data, error } = await supabase
    .from('operations')
    .update({ 
      teaser_url: teaserUrl,
      updated_at: new Date().toISOString() 
    })
    .eq('id', operationId)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando teaser_url:', error);
    throw error;
  }

  console.log('Teaser URL actualizada exitosamente:', data);
  return data;
};
