
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmailTrackingService } from "@/services/emailTrackingService";
import { CreateTrackedEmailData, TrackedEmail } from "@/types/EmailTracking";
import { useToast } from "@/hooks/use-toast";

export const useEmailTracking = (filters?: {
  lead_id?: string;
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: emails = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tracked-emails', filters],
    queryFn: () => EmailTrackingService.getTrackedEmails(filters),
    select: (data) => data.data,
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });

  const {
    data: emailStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['email-stats'],
    queryFn: () => EmailTrackingService.getEmailStats(),
    refetchInterval: 30000
  });

  const createEmailMutation = useMutation({
    mutationFn: (data: CreateTrackedEmailData & { sender_name?: string; sender_email?: string }) => 
      EmailTrackingService.createTrackedEmail(data),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error al enviar email",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado correctamente",
          description: "El email ha sido enviado y está siendo rastreado"
        });
        // Invalidate and refetch email data
        queryClient.invalidateQueries({ queryKey: ['tracked-emails'] });
        queryClient.invalidateQueries({ queryKey: ['email-stats'] });
      }
    },
    onError: (error) => {
      console.error('Email sending error:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el email. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  });

  const sendTrackedEmail = async (emailData: CreateTrackedEmailData & { 
    sender_name?: string; 
    sender_email?: string; 
  }) => {
    return createEmailMutation.mutate(emailData);
  };

  return {
    emails,
    emailStats,
    isLoading,
    statsLoading,
    error,
    sendTrackedEmail,
    isSending: createEmailMutation.isPending
  };
};
