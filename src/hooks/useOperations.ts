
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operation } from '@/types/Operation';

export const useOperations = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          manager:operation_managers(
            id,
            name,
            email,
            phone,
            position
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error en la consulta:', error);
        throw error;
      }

      console.log('Datos obtenidos:', data);

      // Asegurar que los tipos coincidan
      const typedOperations: Operation[] = (data || []).map(op => ({
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
      }));

      console.log('Operaciones procesadas:', typedOperations);
      setOperations(typedOperations);
    } catch (err) {
      console.error('Error cargando operaciones:', err);
      setError('Error al cargar las operaciones');
    } finally {
      setLoading(false);
    }
  };

  const addOperation = async (operationData: Omit<Operation, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .insert([operationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Agregar la nueva operación a la lista si está disponible
      if (data && data.status === 'available') {
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

  useEffect(() => {
    fetchOperations();
  }, []);

  return { operations, loading, error, refetch: fetchOperations, addOperation };
};
