import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmailService } from '../services/emailService';
import { toast } from '@/hooks/use-toast';

export const useEmailAccounts = () => {
  return useQuery({
    queryKey: ['email-accounts'],
    queryFn: EmailService.getEmailAccounts,
  });
};

export const useCreateEmailAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: EmailService.createEmailAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      toast({
        title: "Cuenta de email creada",
        description: "La cuenta se ha configurado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear cuenta",
        description: error.message || "No se pudo crear la cuenta de email.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEmailAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      EmailService.updateEmailAccount(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      toast({
        title: "Cuenta actualizada",
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar la cuenta.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEmailAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: EmailService.deleteEmailAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      toast({
        title: "Cuenta eliminada",
        description: "La cuenta de email se ha eliminado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar la cuenta.",
        variant: "destructive",
      });
    },
  });
};