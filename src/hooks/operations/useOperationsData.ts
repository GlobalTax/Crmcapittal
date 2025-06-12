
import { useState, useEffect } from 'react';
import { Operation } from '@/types/Operation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { fetchOperationsFromDB } from './operationsService';

export const useOperationsData = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { role } = useUserRole();

  const fetchOperations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const typedOperations = await fetchOperationsFromDB(role);
      setOperations(typedOperations);
    } catch (err) {
      console.error('Error cargando operaciones:', err);
      setError('Error al cargar las operaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [role]);

  return { 
    operations, 
    setOperations,
    loading, 
    error, 
    refetch: fetchOperations 
  };
};
