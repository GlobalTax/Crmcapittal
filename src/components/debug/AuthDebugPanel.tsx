import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ProductionSecurityGuard } from '@/components/security/ProductionSecurityGuard';
import { logger } from '@/utils/productionLogger';

export const AuthDebugPanel: React.FC = () => {
  const { user, session, refreshSession } = useAuth();

  const testAuthUID = async () => {
    try {
      logger.debug('Testing authentication functionality');
      
      // Test current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      logger.debug('Session check result', { 
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id,
        hasAccessToken: !!sessionData.session?.access_token,
        sessionError 
      });
      
      // Test direct query
      logger.debug('Testing direct query');
      const { data: queryData, error: queryError } = await supabase.from('leads').select('count').limit(1);
      logger.debug('Direct query result', { dataCount: queryData?.length, error: queryError });
      
      const result = { data: queryData, error: queryError };
      
      // Test RPC function if exists
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('test_auth_uid');
        logger.debug('RPC test_auth_uid result', { rpcData, rpcError });
        return { 
          sessionTest: { data: sessionData, error: sessionError },
          queryTest: result,
          rpcTest: { data: rpcData, error: rpcError }
        };
      } catch (rpcError) {
        logger.debug('RPC function not available');
        return { 
          sessionTest: { data: sessionData, error: sessionError },
          queryTest: result,
          rpcTest: { error: 'RPC not available' }
        };
      }
    } catch (error) {
      logger.error('Auth UID test failed', { error });
      return { error };
    }
  };

  const handleRefreshSession = async () => {
    logger.debug('Manual session refresh triggered');
    await refreshSession();
  };

  return (
    <ProductionSecurityGuard>
      <div className="app-fab-in-main bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2">Auth Debug</h3>
        <div className="space-y-2 text-sm">
          <div>User ID: {user?.id || 'null'}</div>
          <div>Email: {user?.email || 'null'}</div>
          <div>Session: {session ? 'present' : 'null'}</div>
          <div>Access Token: {session?.access_token ? 'present' : 'missing'}</div>
        </div>
        <div className="mt-3 space-y-2">
          <Button size="sm" onClick={testAuthUID}>
            Test auth.uid()
          </Button>
          <Button size="sm" onClick={handleRefreshSession}>
            Refresh Session
          </Button>
        </div>
      </div>
    </ProductionSecurityGuard>
  );
};