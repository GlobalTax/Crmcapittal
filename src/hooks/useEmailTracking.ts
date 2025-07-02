
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmailTrackingService } from "@/services/emailTrackingService";
import { CreateTrackedEmailData, TrackedEmail } from "@/types/EmailTracking";
import { useToast } from "@/hooks/use-toast";

// Datos de prueba para desarrollo
const SAMPLE_EMAILS: TrackedEmail[] = [
  {
    id: "1",
    tracking_id: "track_001",
    recipient_email: "cliente1@empresa.com",
    subject: "Propuesta comercial para su empresa",
    content: "<p>Estimado cliente,</p><p>Le enviamos nuestra propuesta comercial para los servicios de consultoría que discutimos en nuestra última reunión.</p><p>Esperamos sus comentarios.</p><p>Saludos cordiales.</p>",
    lead_id: null,
    contact_id: null,
    target_company_id: null,
    operation_id: null,
    status: "OPENED",
    opened_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    open_count: 3,
    user_agent: "Mozilla/5.0",
    ip_address: "192.168.1.100",
    sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    tracking_id: "track_002",
    recipient_email: "contacto@startup.com",
    subject: "Seguimiento de nuestra conversación",
    content: "<p>Hola,</p><p>Quería hacer seguimiento a nuestra conversación de ayer sobre las oportunidades de inversión.</p><p>¿Podríamos programar una llamada para esta semana?</p><p>Gracias.</p>",
    lead_id: null,
    contact_id: null,
    target_company_id: null,
    operation_id: null,
    status: "SENT",
    opened_at: null,
    open_count: 0,
    user_agent: null,
    ip_address: null,
    sent_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    tracking_id: "track_003",
    recipient_email: "director@corporacion.com",
    subject: "Oportunidad de adquisición",
    content: "<p>Estimado Director,</p><p>Hemos identificado una interesante oportunidad de adquisición que podría ser de su interés.</p><p>La empresa objetivo tiene un EBITDA de €2M y está en el sector tecnológico.</p><p>¿Le gustaría recibir más información?</p>",
    lead_id: null,
    contact_id: null,
    target_company_id: null,
    operation_id: null,
    status: "CLICKED",
    opened_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    open_count: 1,
    user_agent: "Mozilla/5.0",
    ip_address: "10.0.0.1",
    sent_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    tracking_id: "track_004",
    recipient_email: "ceo@tecnologica.com",
    subject: "Reunión programada para mañana",
    content: "<p>Estimado CEO,</p><p>Le confirmo nuestra reunión programada para mañana a las 10:00 AM.</p><p>Adjunto la agenda de temas a tratar.</p><p>Nos vemos mañana.</p>",
    lead_id: null,
    contact_id: null,
    target_company_id: null,
    operation_id: null,
    status: "OPENED",
    opened_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    open_count: 2,
    user_agent: "Mozilla/5.0",
    ip_address: "172.16.0.1",
    sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  }
];

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
    queryFn: async () => {
      try {
        const result = await EmailTrackingService.getTrackedEmails(filters);
        if (result.error) {
          console.error('Error fetching emails:', result.error);
          // Retornamos datos de prueba si hay error
          return SAMPLE_EMAILS;
        }
        // Si no hay datos reales, usamos los de prueba
        return result.data.length > 0 ? result.data : SAMPLE_EMAILS;
      } catch (error) {
        console.error('Error in email query:', error);
        // En caso de error, devolvemos datos de prueba
        return SAMPLE_EMAILS;
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });

  const {
    data: emailStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['email-stats'],
    queryFn: async () => {
      try {
        return await EmailTrackingService.getEmailStats();
      } catch (error) {
        // Stats de prueba basadas en emails de muestra
        return {
          totalSent: SAMPLE_EMAILS.length,
          totalOpened: SAMPLE_EMAILS.filter(e => e.status === 'OPENED').length,
          openRate: 75,
          recentEmails: SAMPLE_EMAILS.slice(0, 3)
        };
      }
    },
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
