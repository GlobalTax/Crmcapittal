import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nylasEmailService, type NylasAccount, type EmailSetupData } from '@/services/nylasEmailService';
import { useToast } from '@/hooks/use-toast';
import { createLogger } from '@/utils/productionLogger';

const logger = createLogger('useNylasAccounts');

export const useNylasAccounts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Nylas accounts
  const {
    data: accounts = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['nylas-accounts'],
    queryFn: async () => {
      const result = await nylasEmailService.getNylasAccounts();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  // Setup email account mutation
  const setupAccountMutation = useMutation({
    mutationFn: (emailData: EmailSetupData) => nylasEmailService.setupEmailAccount(emailData),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Cuenta configurada",
          description: "La cuenta de email se ha configurado correctamente.",
        });
        queryClient.invalidateQueries({ queryKey: ['nylas-accounts'] });
      } else {
        toast({
          title: "Error en configuración",
          description: result.error || "Error desconocido al configurar la cuenta.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error en configuración",
        description: error.message || "Error al configurar la cuenta de email.",
        variant: "destructive",
      });
    },
  });

  // Sync emails mutation
  const syncEmailsMutation = useMutation({
    mutationFn: (accountId: string) => nylasEmailService.syncEmails(accountId),
    onSuccess: (result, accountId) => {
      if (result.success) {
        toast({
          title: "Sincronización completada",
          description: `Se sincronizaron ${result.synced_count || 0} emails.`,
        });
        // Invalidate both accounts and emails
        queryClient.invalidateQueries({ queryKey: ['nylas-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['tracked-emails'] });
      } else {
        toast({
          title: "Error en sincronización",
          description: result.error || "Error desconocido al sincronizar emails.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error en sincronización",
        description: error.message || "Error al sincronizar emails.",
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (accountId: string) => nylasEmailService.deleteAccount(accountId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Cuenta eliminada",
          description: "La cuenta de email ha sido eliminada.",
        });
        queryClient.invalidateQueries({ queryKey: ['nylas-accounts'] });
      } else {
        toast({
          title: "Error al eliminar",
          description: result.error || "Error desconocido al eliminar la cuenta.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar",
        description: error.message || "Error al eliminar la cuenta de email.",
        variant: "destructive",
      });
    },
  });

  return {
    accounts,
    isLoading,
    error: error?.message || null,
    refetch,
    setupAccount: setupAccountMutation.mutate,
    isSettingUp: setupAccountMutation.isPending,
    syncEmails: syncEmailsMutation.mutate,
    isSyncing: syncEmailsMutation.isPending,
    deleteAccount: deleteAccountMutation.mutate,
    isDeleting: deleteAccountMutation.isPending,
  };
};