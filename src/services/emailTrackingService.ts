import { supabase } from "@/integrations/supabase/client";
import { CreateTrackedEmailData, TrackedEmail } from "@/types/EmailTracking";

export class EmailTrackingService {
  static async createTrackedEmail(data: CreateTrackedEmailData & { 
    sender_name?: string; 
    sender_email?: string; 
  }): Promise<{ data: TrackedEmail | null; error: string | null }> {
    try {
      // Call the edge function to send the email
      const { data: response, error } = await supabase.functions.invoke('send-tracked-email', {
        body: {
          recipient_email: data.recipient_email,
          subject: data.subject || 'Sin asunto',
          content: data.content,
          lead_id: data.lead_id,
          contact_id: data.contact_id,
          target_company_id: data.target_company_id,
          operation_id: data.operation_id,
          sender_name: data.sender_name,
          sender_email: data.sender_email
        }
      });

      if (error) {
        console.error('Error calling send-tracked-email function:', error);
        return { data: null, error: error.message };
      }

      if (!response.success) {
        return { data: null, error: response.error || 'Unknown error occurred' };
      }

      // Fetch the created email record
      const { data: emailRecord, error: fetchError } = await supabase
        .from('tracked_emails')
        .select('*')
        .eq('id', response.email_id)
        .single();

      if (fetchError) {
        console.error('Error fetching created email:', fetchError);
        return { data: null, error: fetchError.message };
      }

      // Convert the database response to match our TypeScript interface
      const convertedEmail: TrackedEmail = {
        ...emailRecord,
        ip_address: emailRecord.ip_address != null ? String(emailRecord.ip_address) : null
      };

      return { data: convertedEmail, error: null };

    } catch (error) {
      console.error('Error in createTrackedEmail:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getTrackedEmails(filters?: {
    lead_id?: string;
    contact_id?: string;
    target_company_id?: string;
    operation_id?: string;
  }): Promise<{ data: TrackedEmail[]; error: string | null }> {
    try {
      let query = supabase
        .from('tracked_emails')
        .select('*')
        .order('sent_at', { ascending: false });

      if (filters?.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }
      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }
      if (filters?.target_company_id) {
        query = query.eq('target_company_id', filters.target_company_id);
      }
      if (filters?.operation_id) {
        query = query.eq('operation_id', filters.operation_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert the database response to match our TypeScript interface
      const convertedEmails: TrackedEmail[] = (data || []).map(email => ({
        ...email,
        ip_address: email.ip_address != null ? String(email.ip_address) : null
      }));

      return { data: convertedEmails, error: null };
    } catch (error) {
      console.error('Error fetching tracked emails:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getEmailStats(): Promise<{
    totalSent: number;
    totalOpened: number;
    openRate: number;
    recentEmails: TrackedEmail[];
  }> {
    try {
      const { data: emails } = await this.getTrackedEmails();
      
      const totalSent = emails.length;
      const totalOpened = emails.filter(email => email.status === 'OPENED').length;
      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const recentEmails = emails.slice(0, 5);

      return {
        totalSent,
        totalOpened,
        openRate,
        recentEmails
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      return {
        totalSent: 0,
        totalOpened: 0,
        openRate: 0,
        recentEmails: []
      };
    }
  }

  static buildEmailContent(content: string, trackingId: string): string {
    const trackingPixel = `<img src="${window.location.origin}/functions/v1/track-email-open/${trackingId}" width="1" height="1" alt="" style="display:block;" />`;
    return `${content}${trackingPixel}`;
  }
}
