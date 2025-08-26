import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/productionLogger';

const logger = createLogger('nylasEmailService');

export interface NylasAccount {
  id: string;
  user_id: string;
  email_address: string;
  provider: string;
  grant_id: string | null;
  access_token: string | null;
  connector_id: string | null;
  account_status: string;
  settings: any;
  created_at: string;
  updated_at: string;
  last_sync_at: string | null;
}

export interface EmailSetupData {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
}

export interface SendEmailData {
  accountId: string;
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  replyToMessageId?: string;
}

class NylasEmailService {
  async setupEmailAccount(emailData: EmailSetupData): Promise<{ success: boolean; account?: NylasAccount; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('nylas-setup', {
        body: emailData,
      });

      if (error) {
        logger.error('Error setting up email account', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true, account: data.account };
    } catch (error: any) {
      logger.error('Error in setupEmailAccount', error);
      return { success: false, error: error.message };
    }
  }

  async syncEmails(accountId: string): Promise<{ success: boolean; synced_count?: number; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('nylas-sync', {
        body: { accountId },
      });

      if (error) {
        logger.error('Error syncing emails', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true, synced_count: data.synced_count };
    } catch (error: any) {
      logger.error('Error in syncEmails', error);
      return { success: false, error: error.message };
    }
  }

  async sendEmail(emailData: SendEmailData): Promise<{ success: boolean; message_id?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('nylas-send', {
        body: emailData,
      });

      if (error) {
        logger.error('Error sending email', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true, message_id: data.message_id };
    } catch (error: any) {
      logger.error('Error in sendEmail', error);
      return { success: false, error: error.message };
    }
  }

  async archiveEmail(accountId: string, threadId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('nylas-archive', {
        body: { accountId, threadId },
      });

      if (error) {
        logger.error('Error archiving email', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Error in archiveEmail', error);
      return { success: false, error: error.message };
    }
  }

  async getNylasAccounts(): Promise<{ data: NylasAccount[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('nylas_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching Nylas accounts', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      logger.error('Error in getNylasAccounts', error);
      return { data: [], error: error.message };
    }
  }

  async deleteAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('nylas_accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        logger.error('Error deleting Nylas account', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      logger.error('Error in deleteAccount', error);
      return { success: false, error: error.message };
    }
  }
}

export const nylasEmailService = new NylasEmailService();