
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '@/types/Operation';

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
