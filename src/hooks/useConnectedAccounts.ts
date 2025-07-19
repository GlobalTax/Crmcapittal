
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ConnectedAccount {
  id: string;
  provider: string;
  email: string;
  last_sync_at?: string;
  expires_at?: string;
}

export const useConnectedAccounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const connectAccount = async (provider: 'google' | 'microsoft') => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAccount: ConnectedAccount = {
        id: Math.random().toString(36).substr(2, 9),
        provider,
        email: `usuario@${provider === 'google' ? 'gmail.com' : 'outlook.com'}`,
        last_sync_at: new Date().toISOString()
      };
      
      setAccounts(prev => [...prev, newAccount]);
      
      toast({
        title: "Cuenta conectada ✓",
        description: `Tu cuenta de ${provider} ha sido conectada exitosamente.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo conectar la cuenta.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast({
        title: "Cuenta desconectada",
        description: "La cuenta ha sido desconectada exitosamente."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desconectar la cuenta.",
        variant: "destructive"
      });
    }
  };

  const syncAccount = async (accountId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, last_sync_at: new Date().toISOString() }
          : acc
      ));
      toast({
        title: "Sincronización completa ✓",
        description: "Los datos han sido sincronizados."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error en la sincronización.",
        variant: "destructive"
      });
    }
  };

  const isConnected = (provider: string) => {
    return accounts.some(acc => acc.provider === provider);
  };

  const isTokenExpired = (account: ConnectedAccount) => {
    if (!account.expires_at) return false;
    return new Date(account.expires_at) < new Date();
  };

  return {
    accounts,
    loading,
    connectAccount,
    disconnectAccount,
    syncAccount,
    isConnected,
    isTokenExpired
  };
};
