
import { supabase } from "@/integrations/supabase/client";
import { CreateTrackedEmailData, TrackedEmail } from "@/types/EmailTracking";

export class EmailTrackingService {
  static async createTrackedEmail(data: CreateTrackedEmailData): Promise<{ data: TrackedEmail | null; error: string | null }> {
    try {
      const { data: trackedEmail, error } = await supabase
        .from('tracked_emails')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { data: trackedEmail, error: null };
    } catch (error) {
      console.error('Error creating tracked email:', error);
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

      return { data: data || [], error: null };
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
    const trackingPixel = `<img src="${window.location.origin}/api/track/${trackingId}" width="1" height="1" alt="" style="display:block;" />`;
    
    // Add tracking pixel at the end of the email content
    return `${content}${trackingPixel}`;
  }
}
