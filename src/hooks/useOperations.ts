
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
        
        // Manejar el caso donde manager puede ser null o undefined
        let managerData = undefined;
        if (op.manager && typeof op.manager === 'object' && op.manager.id) {
          managerData = {
            id: op.manager.id,
            name: op.manager.name,
            email: op.manager.email,
            phone: op.manager.phone,
            position: op.manager.position
          };
        }
        
        return {
          ...op,
          operation_type: op.operation_type as Operation['operation_type'],
          status: op.status as Operation['status'],
          manager: managerData
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
      console.log('Añadiendo operación con datos:', operationData);
      console.log('Usuario actual:', user?.id);

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Preparar los datos para la inserción
      const insertData = {
        company_name: operationData.company_name,
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
        created_by: user.id
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

      // Agregar la nueva operación a la lista
      if (data) {
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
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al añadir la operación' 
      };
    }
  };

  const updateOperation = async (operationId: string, operationData: Partial<Operation>) => {
    try {
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

      // Actualizar la operación en el estado local
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              ...operationData, 
              operation_type: data.operation_type as Operation['operation_type'],
              status: data.status as Operation['status'],
              updated_at: data.updated_at 
            }
          : op
      ));

      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando operación:', err);
      return { data: null, error: 'Error al actualizar la operación' };
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

  const deleteOperation = async (operationId: string) => {
    try {
      const { error } = await supabase
        .from('operations')
        .delete()
        .eq('id', operationId);

      if (error) {
        throw error;
      }

      // Remover la operación del estado local
      setOperations(prev => prev.filter(op => op.id !== operationId));

      return { error: null };
    } catch (err) {
      console.error('Error eliminando operación:', err);
      return { error: 'Error al eliminar la operación' };
    }
  };

  const updateTeaserUrl = async (operationId: string, teaserUrl: string) => {
    try {
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
        throw error;
      }

      // Actualizar la operación en el estado local
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, teaser_url: teaserUrl, updated_at: data.updated_at }
          : op
      ));

      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando URL del teaser:', err);
      return { data: null, error: 'Error al actualizar el teaser' };
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
    updateOperation,
    updateOperationStatus,
    deleteOperation,
    updateTeaserUrl
  };
};
