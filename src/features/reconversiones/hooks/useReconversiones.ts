/**
 * Reconversiones Hook
 * 
 * Custom hook for managing reconversion data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { ReconversionService } from '../services/ReconversionService';
import { useToast } from '@/hooks/use-toast';
import { createLogger } from '@/utils/productionLogger';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];
type CreateReconversionData = Database['public']['Tables']['reconversiones']['Insert'];

const logger = createLogger('useReconversiones');

export function useReconversiones() {
  const [reconversiones, setReconversiones] = useState<Reconversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchReconversiones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReconversionService.getReconversiones();
      setReconversiones(data);
      logger.info('Reconversiones fetched successfully', { count: data.length });
    } catch (err) {
      const error = err as Error;
      logger.error('Error fetching reconversiones', error);
      setError(error);
      toast({
        title: "Error",
        description: "Error al cargar reconversiones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createReconversion = useCallback(async (reconversionData: CreateReconversionData) => {
    try {
      const data = await ReconversionService.createReconversion(reconversionData);
      setReconversiones(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Reconversión creada exitosamente",
      });
      logger.info('Reconversion created successfully', { id: data.id });
      return data;
    } catch (err) {
      const error = err as Error;
      logger.error('Error creating reconversion', error);
      setError(error);
      toast({
        title: "Error",
        description: "Error al crear reconversión",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateReconversion = useCallback(async (id: string, updates: Partial<CreateReconversionData>) => {
    try {
      const data = await ReconversionService.updateReconversion(id, updates);
      setReconversiones(prev => 
        prev.map(r => r.id === id ? { ...r, ...data } : r)
      );
      toast({
        title: "Éxito",
        description: "Reconversión actualizada exitosamente",
      });
      logger.info('Reconversion updated successfully', { id });
      return data;
    } catch (err) {
      const error = err as Error;
      logger.error('Error updating reconversion', error);
      setError(error);
      toast({
        title: "Error",
        description: "Error al actualizar reconversión",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteReconversion = useCallback(async (id: string) => {
    try {
      await ReconversionService.deleteReconversion(id);
      setReconversiones(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Éxito",
        description: "Reconversión eliminada exitosamente",
      });
      logger.info('Reconversion deleted successfully', { id });
    } catch (err) {
      const error = err as Error;
      logger.error('Error deleting reconversion', error);
      setError(error);
      toast({
        title: "Error",
        description: "Error al eliminar reconversión",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const assignReconversion = useCallback(async (id: string, assignedTo: string) => {
    try {
      const data = await ReconversionService.assignReconversion(id, assignedTo);
      setReconversiones(prev => 
        prev.map(r => r.id === id ? { ...r, ...data } : r)
      );
      toast({
        title: "Éxito",
        description: "Reconversión asignada exitosamente",
      });
      logger.info('Reconversion assigned successfully', { id, assignedTo });
      return data;
    } catch (err) {
      const error = err as Error;
      logger.error('Error assigning reconversion', error);
      setError(error);
      toast({
        title: "Error",
        description: "Error al asignar reconversión",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Get reconversion stats
  const stats = ReconversionService.getReconversionStats(reconversiones);

  // Only fetch on mount to prevent infinite loops
  useEffect(() => {
    fetchReconversiones();
  }, []); // Empty dependency array

  return {
    // Data
    reconversiones,
    stats,
    loading,
    error,
    
    // Actions
    createReconversion,
    updateReconversion,
    deleteReconversion,
    assignReconversion,
    refetch: fetchReconversiones
  };
}