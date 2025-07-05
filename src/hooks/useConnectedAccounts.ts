import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ConnectedAccount {
  id: string;
  user_id: string;
  provider: 'microsoft' | 'google';
  provider_account_id: string | null;
  email: string | null;
  name: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useConnectedAccounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAccounts = async (retryCount = 0) => {
    try {
      console.log('useConnectedAccounts: Starting to fetch accounts...', retryCount > 0 ? `(retry ${retryCount})` : '');
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useConnectedAccounts: No authenticated user found');
        setAccounts([]);
        return;
      }

      console.log('useConnectedAccounts: User authenticated:', user.id);
      console.log('useConnectedAccounts: Attempting to query connected_accounts table...');

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      console.log('useConnectedAccounts: Raw query result:', { 
        data, 
        error, 
        count: data?.length || 0,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details 
      });

      if (error) {
        console.error('useConnectedAccounts: Database error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Retry on certain error codes
        if ((error.code === 'PGRST116' || error.message?.includes('406') || error.message?.includes('400')) && retryCount < 2) {
          console.log(`useConnectedAccounts: Retrying in ${Math.pow(2, retryCount)} seconds...`);
          setTimeout(() => fetchAccounts(retryCount + 1), Math.pow(2, retryCount) * 1000);
          return;
        }
        
        throw error;
      }

      const processedAccounts = data ? data.map(account => ({
        ...account,
        provider: account.provider as 'microsoft' | 'google'
      })) : [];

      console.log('useConnectedAccounts: Processed accounts:', {
        count: processedAccounts.length,
        providers: processedAccounts.map(acc => acc.provider),
        accounts: processedAccounts.map(acc => ({
          id: acc.id,
          provider: acc.provider,
          email: acc.email,
          isActive: acc.is_active,
          lastSync: acc.last_sync_at,
          expiresAt: acc.expires_at
        }))
      });
      
      setAccounts(processedAccounts);
    } catch (err) {
      console.error('useConnectedAccounts: Error fetching connected accounts:', {
        error: err,
        message: err.message,
        stack: err.stack,
        retryCount
      });
      
      // Retry on network errors
      if (retryCount < 2 && (err.message?.includes('fetch') || err.message?.includes('network'))) {
        console.log(`useConnectedAccounts: Network error, retrying in ${Math.pow(2, retryCount)} seconds...`);
        setTimeout(() => fetchAccounts(retryCount + 1), Math.pow(2, retryCount) * 1000);
        return;
      }
      
      setError(`Failed to load connected accounts: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (provider: 'microsoft' | 'google') => {
    try {
      const redirectUrl = `${window.location.origin}/settings/email-calendar`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectUrl,
          scopes: provider === 'microsoft' 
            ? 'openid profile email Mail.Read Mail.Send Calendars.Read Calendars.ReadWrite offline_access'
            : 'openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Redirecting...",
        description: `Connecting to ${provider === 'microsoft' ? 'Microsoft' : 'Google'}`,
      });

    } catch (err) {
      console.error(`Error connecting ${provider}:`, err);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${provider === 'microsoft' ? 'Microsoft' : 'Google'}`,
        variant: "destructive",
      });
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('connected_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) {
        throw error;
      }

      toast({
        title: "Account Disconnected",
        description: "The account has been disconnected successfully",
      });

      // Refresh accounts list
      await fetchAccounts();
    } catch (err) {
      console.error('Error disconnecting account:', err);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect the account",
        variant: "destructive",
      });
    }
  };

  const syncAccount = async (accountId: string, syncType: 'emails' | 'calendar' | 'all' = 'all') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('microsoft-graph-sync', {
        body: {
          syncType,
          userId: user.id,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sync Completed",
        description: `Successfully synced ${syncType === 'all' ? 'emails and calendar' : syncType}`,
      });

      // Refresh accounts list to update sync time
      await fetchAccounts();

      return data;
    } catch (err) {
      console.error('Error syncing account:', err);
      toast({
        title: "Sync Failed",
        description: "Failed to sync account data",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getAccountByProvider = (provider: 'microsoft' | 'google') => {
    return accounts.find(account => account.provider === provider);
  };

  const isConnected = (provider: 'microsoft' | 'google') => {
    return accounts.some(account => account.provider === provider && account.is_active);
  };

  const isTokenExpired = (account: ConnectedAccount) => {
    if (!account.expires_at) return false;
    return new Date() >= new Date(account.expires_at);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    connectAccount,
    disconnectAccount,
    syncAccount,
    getAccountByProvider,
    isConnected,
    isTokenExpired,
    refreshAccounts: fetchAccounts,
  };
};