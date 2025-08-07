import { supabase } from '@/integrations/supabase/client';
import { 
  EmailAccount, 
  Email, 
  EmailTemplate, 
  EmailSequence,
  EmailConversation,
  EmailSettings,
  EmailComposeData,
  EmailFilter
} from '../types';

export class EmailService {
  // Email Accounts
  static async getEmailAccounts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .order('is_default', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createEmailAccount(account: any): Promise<any> {
    const { data, error } = await supabase
      .from('email_accounts')
      .insert(account)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateEmailAccount(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('email_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteEmailAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Emails
  static async getEmails(filter: EmailFilter = {}): Promise<any[]> {
    let query = supabase
      .from('emails')
      .select(`
        *,
        account:email_accounts(email_address, display_name)
      `)
      .order('email_date', { ascending: false });

    if (filter.account_id) {
      query = query.eq('account_id', filter.account_id);
    }
    if (filter.direction) {
      query = query.eq('direction', filter.direction);
    }
    if (filter.is_read !== undefined) {
      query = query.eq('is_read', filter.is_read);
    }
    if (filter.is_starred !== undefined) {
      query = query.eq('is_starred', filter.is_starred);
    }
    if (filter.contact_id) {
      query = query.eq('contact_id', filter.contact_id);
    }
    if (filter.lead_id) {
      query = query.eq('lead_id', filter.lead_id);
    }
    if (filter.date_from) {
      query = query.gte('email_date', filter.date_from);
    }
    if (filter.date_to) {
      query = query.lte('email_date', filter.date_to);
    }
    if (filter.search) {
      query = query.or(`subject.ilike.%${filter.search}%,sender_email.ilike.%${filter.search}%,body_text.ilike.%${filter.search}%`);
    }

    const { data, error } = await query.limit(100);
    
    if (error) throw error;
    return data || [];
  }

  static async getEmailById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('emails')
      .select(`
        *,
        account:email_accounts(email_address, display_name),
        tracking_events:email_tracking_events(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  static async sendEmail(emailData: EmailComposeData, accountId: string): Promise<any> {
    // Get account info
    const { data: account } = await supabase
      .from('email_accounts')
      .select('email_address')
      .eq('id', accountId)
      .single();

    const trackingPixelUrl = emailData.tracking_enabled 
      ? `/api/email/track/pixel/{{email_id}}.png` 
      : undefined;

    const emailRecord = {
      account_id: accountId,
      message_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      thread_id: `thread-${Date.now()}`,
      subject: emailData.subject,
      sender_email: account?.email_address || '',
      recipient_emails: emailData.to,
      cc_emails: emailData.cc || [],
      bcc_emails: emailData.bcc || [],
      body_html: emailData.body_html,
      body_text: emailData.body_text,
      direction: 'outgoing',
      status: 'sent',
      email_date: new Date().toISOString(),
      contact_id: emailData.contact_id,
      lead_id: emailData.lead_id,
      deal_id: emailData.deal_id,
      company_id: emailData.company_id,
      template_id: emailData.template_id,
      tracking_pixel_url: trackingPixelUrl,
      created_by: (await supabase.auth.getUser()).data.user?.id
    };

    const { data, error } = await supabase
      .from('emails')
      .insert(emailRecord)
      .select()
      .single();
    
    if (error) throw error;

    // Update tracking pixel URL with actual email ID
    if (trackingPixelUrl) {
      await supabase
        .from('emails')
        .update({ tracking_pixel_url: `/api/email/track/pixel/${data.id}.png` })
        .eq('id', data.id);
    }

    return data;
  }

  static async markAsRead(id: string, isRead: boolean = true): Promise<void> {
    const { error } = await supabase
      .from('emails')
      .update({ is_read: isRead })
      .eq('id', id);
    
    if (error) throw error;
  }

  static async toggleStar(id: string): Promise<void> {
    const { data: email } = await supabase
      .from('emails')
      .select('is_starred')
      .eq('id', id)
      .single();

    if (email) {
      const { error } = await supabase
        .from('emails')
        .update({ is_starred: !email.is_starred })
        .eq('id', id);
      
      if (error) throw error;
    }
  }

  // Email Templates - usando la tabla existente
  static async getEmailTemplates(): Promise<any[]> {
    const { data, error } = await supabase
      .from('communication_templates')
      .select('*')
      .eq('template_type', 'email')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async createEmailTemplate(template: any): Promise<any> {
    const { data, error } = await supabase
      .from('communication_templates')
      .insert({
        name: template.name,
        subject: template.subject,
        content: template.body_html,
        template_type: 'email',
        variables: template.variables || [],
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateEmailTemplate(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('communication_templates')
      .update({
        name: updates.name,
        subject: updates.subject,
        content: updates.body_html,
        variables: updates.variables
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteEmailTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('communication_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Email Conversations
  static async getConversations(): Promise<any[]> {
    const { data, error } = await supabase
      .from('email_conversations')
      .select('*')
      .order('last_email_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getConversationEmails(threadId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('thread_id', threadId)
      .order('email_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Email Settings
  static async getEmailSettings(): Promise<any | null> {
    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  static async updateEmailSettings(settings: any): Promise<any> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('email_settings')
      .upsert({
        ...settings,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Tracking
  static async trackEmailEvent(emailId: string, eventType: string, eventData?: any): Promise<void> {
    const { error } = await supabase.rpc('process_email_tracking', {
      p_email_id: emailId,
      p_event_type: eventType,
      p_event_data: eventData || {},
      p_ip_address: null,
      p_user_agent: navigator.userAgent
    });
    
    if (error) {
      // Fallback: direct insert if function fails
      const { error: insertError } = await supabase
        .from('email_tracking_events')
        .insert({
          email_id: emailId,
          event_type: eventType,
          event_data: eventData || {},
          user_agent: navigator.userAgent
        });
      
      if (insertError) throw insertError;
    }
  }

  // Merge Fields
  static getMergeFields() {
    return [
      { key: 'contact.nombre', label: 'Nombre del Contacto', description: 'Nombre completo del contacto', example: 'Juan Pérez' },
      { key: 'contact.email', label: 'Email del Contacto', description: 'Dirección de email', example: 'juan@empresa.com' },
      { key: 'contact.empresa', label: 'Empresa', description: 'Nombre de la empresa', example: 'Acme Corp' },
      { key: 'contact.cargo', label: 'Cargo', description: 'Posición en la empresa', example: 'Director General' },
      { key: 'lead.valor', label: 'Valor del Lead', description: 'Valor estimado', example: '50,000€' },
      { key: 'lead.estado', label: 'Estado del Lead', description: 'Estado actual', example: 'Calificado' },
      { key: 'deal.nombre', label: 'Nombre del Deal', description: 'Título de la operación', example: 'Adquisición TechCorp' },
      { key: 'deal.valor', label: 'Valor del Deal', description: 'Valor de la operación', example: '2,500,000€' },
      { key: 'usuario.nombre', label: 'Tu Nombre', description: 'Nombre del usuario actual', example: 'María García' },
      { key: 'usuario.email', label: 'Tu Email', description: 'Email del usuario actual', example: 'maria@crmcapittal.com' },
      { key: 'fecha.hoy', label: 'Fecha de Hoy', description: 'Fecha actual', example: '15 de marzo de 2024' },
      { key: 'empresa.nombre', label: 'Nuestra Empresa', description: 'Nombre de tu empresa', example: 'CRM Capittal' }
    ];
  }

  static replaceMergeFields(template: string, data: any): string {
    let result = template;
    const mergeFields = this.getMergeFields();

    mergeFields.forEach(field => {
      const regex = new RegExp(`{{\\s*${field.key}\\s*}}`, 'g');
      const value = this.getNestedValue(data, field.key) || field.example;
      result = result.replace(regex, value);
    });

    return result;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}