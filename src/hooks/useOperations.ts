
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '@/types/Operation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { role } = useUserRole();

  const fetchOperations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando consulta de operaciones...');
      
      let query = supabase
        .from('operations')
        .select(`
          *,
          manager:operation_managers!manager_id(
            id,
            name,
            email,
            phone,
            position
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

      console.log('Datos obtenidos de la consulta:', data);

      // Procesar y mapear los datos
      const typedOperations: Operation[] = (data || []).map(op => {
        console.log('Procesando operación:', op.company_name, 'Manager:', op.manager);
        return {
          ...op,
          operation_type: op.operation_type as Operation['operation_type'],
          status: op.status as Operation['status'],
          manager: op.manager ? {
            id: op.manager.id,
            name: op.manager.name,
            email: op.manager.email,
            phone: op.manager.phone,
            position: op.manager.position
          } : undefined
        };
      });

      console.log('Operaciones procesadas con gestores:', typedOperations);
      setOperations(typedOperations);
    } catch (err) {
      console.error('Error cargando operaciones:', err);
      setError('Error al cargar las operaciones');
    } finally {
      setLoading(false);
    }
  };

  const addOperation = async (operationData: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">) => {
    try {
      // Determinar el estado inicial basado en el rol del usuario
      let initialStatus = 'pending_review'; // Por defecto para usuarios normales
      
      if (role === 'admin' || role === 'superadmin') {
        // Los admins pueden crear operaciones directamente como 'available'
        initialStatus = operationData.status || 'available';
      }

      const { data, error } = await supabase
        .from('operations')
        .insert([{
          ...operationData,
          status: initialStatus,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Solo agregar a la lista si es visible para el usuario actual
      if (data && (role === 'admin' || role === 'superadmin' || data.status === 'available')) {
        const typedOperation: Operation = {
          ...data,
          operation_type: data.operation_type as Operation['operation_type'],
          status: data.status as Operation['status']
        };
        setOperations(prev => [typedOperation, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error añadiendo operación:', err);
      return { data: null, error: 'Error al añadir la operación' };
    }
  };

  const updateOperationStatus = async (operationId: string, newStatus: Operation['status']) => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', operationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Actualizar la operación en el estado local
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: newStatus, updated_at: data.updated_at }
          : op
      ));

      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando estado de operación:', err);
      return { data: null, error: 'Error al actualizar el estado de la operación' };
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [role]); // Re-fetch cuando cambie el rol

  return { 
    operations, 
    loading, 
    error, 
    refetch: fetchOperations, 
    addOperation,
    updateOperationStatus
  };
};
