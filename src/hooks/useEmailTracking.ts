
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
    select: (data) => data.data
  });

  const {
    data: emailStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['email-stats'],
    queryFn: () => EmailTrackingService.getEmailStats(),
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const createEmailMutation = useMutation({
    mutationFn: (data: CreateTrackedEmailData) => EmailTrackingService.createTrackedEmail(data),
    onSuccess: (result) => {
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado",
          description: "El email ha sido enviado correctamente"
        });
        queryClient.invalidateQueries({ queryKey: ['tracked-emails'] });
        queryClient.invalidateQueries({ queryKey: ['email-stats'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo enviar el email",
        variant: "destructive"
      });
    }
  });

  const sendTrackedEmail = async (emailData: CreateTrackedEmailData) => {
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
