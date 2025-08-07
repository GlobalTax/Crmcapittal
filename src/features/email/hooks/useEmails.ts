import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmailService } from '../services/emailService';
import { EmailFilter, EmailComposeData } from '../types';
import { toast } from '@/hooks/use-toast';

export const useEmails = (filter: EmailFilter = {}) => {
  return useQuery({
    queryKey: ['emails', filter],
    queryFn: () => EmailService.getEmails(filter),
  });
};

export const useEmailById = (id: string) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => EmailService.getEmailById(id),
    enabled: !!id,
  });
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ emailData, accountId }: { emailData: EmailComposeData; accountId: string }) =>
      EmailService.sendEmail(emailData, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-conversations'] });
      toast({
        title: "Email enviado",
        description: "El mensaje se ha enviado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar email",
        description: error.message || "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead?: boolean }) =>
      EmailService.markAsRead(id, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado.",
        variant: "destructive",
      });
    },
  });
};

export const useToggleStar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: EmailService.toggleStar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar como favorito.",
        variant: "destructive",
      });
    },
  });
};

export const useTrackEmailEvent = () => {
  return useMutation({
    mutationFn: ({ emailId, eventType, eventData }: { 
      emailId: string; 
      eventType: string; 
      eventData?: any;
    }) => EmailService.trackEmailEvent(emailId, eventType, eventData),
  });
};