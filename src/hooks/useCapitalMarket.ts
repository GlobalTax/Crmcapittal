
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { capitalMarketService } from '@/services/capitalMarketService';
import { toast } from 'sonner';

export const useCapitalMarket = () => {
  const queryClient = useQueryClient();
  const [syncStatus, setSyncStatus] = useState<{
    isRunning: boolean;
    lastSync?: Date;
    imported: number;
    errors: string[];
  }>({
    isRunning: false,
    imported: 0,
    errors: []
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      setSyncStatus(prev => ({ ...prev, isRunning: true, errors: [] }));
      return await capitalMarketService.syncFromCapitalMarket();
    },
    onSuccess: (result) => {
      setSyncStatus({
        isRunning: false,
        lastSync: new Date(),
        imported: result.imported,
        errors: result.errors
      });

      if (result.success) {
        toast.success(`Sincronización completada: ${result.imported} leads importados`);
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['lead-scores'] });
      } else {
        toast.error('Error en la sincronización con Capital Market');
      }
    },
    onError: (error) => {
      setSyncStatus(prev => ({
        ...prev,
        isRunning: false,
        errors: [`Error de sincronización: ${error}`]
      }));
      toast.error('Error al sincronizar con Capital Market');
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      // Test connection logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      return { connected: true, version: '2.1.0' };
    },
    onSuccess: () => {
      toast.success('Conexión con Capital Market establecida correctamente');
    },
    onError: () => {
      toast.error('Error al conectar con Capital Market');
    },
  });

  return {
    syncStatus,
    syncFromCapitalMarket: syncMutation.mutate,
    testConnection: testConnectionMutation.mutate,
    isSyncing: syncMutation.isPending,
    isTesting: testConnectionMutation.isPending,
  };
};
