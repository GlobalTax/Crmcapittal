import { useState, useEffect } from 'react';
import { Operation } from '../types/Operation';
import { useAuth } from '@/stores/useAuthStore';
import { useUserRole } from '@/hooks/useUserRole';
import { fetchOperationsFromDB } from '../services/operationsService';

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
      
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const typedOperations = await fetchOperationsFromDB(role);
        clearTimeout(timeoutId);
        setOperations(typedOperations || []); // Ensure it's always an array
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (err) {
      console.error('Error cargando operaciones:', err);
      setError(err.name === 'AbortError' ? 'Timeout al cargar operaciones' : 'Error al cargar las operaciones');
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