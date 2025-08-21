import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ProductionSecurityGuard } from '@/components/security/ProductionSecurityGuard';

export const AuthDebugPanel: React.FC = () => {
  const { user, session, refreshSession } = useAuth();

  const testAuthUID = async () => {
    try {
      console.log('🔍 Testing authentication...');
      
      // Test current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 Session check:', { 
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id,
        hasAccessToken: !!sessionData.session?.access_token,
        sessionError 
      });
      
      // Test direct query
      console.log('🔧 Testing direct query...');
      const { data: queryData, error: queryError } = await supabase.from('leads').select('count').limit(1);
      console.log('✅ Direct query result:', { data: queryData, error: queryError });
      
      const result = { data: queryData, error: queryError };
      
      // Test RPC function if exists
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('test_auth_uid');
        console.log('🔍 RPC test_auth_uid:', { data: rpcData, error: rpcError });
        return { 
          sessionTest: { data: sessionData, error: sessionError },
          queryTest: result,
          rpcTest: { data: rpcData, error: rpcError }
        };
      } catch (rpcError) {
        console.log('🔍 RPC function not available');
        return { 
          sessionTest: { data: sessionData, error: sessionError },
          queryTest: result,
          rpcTest: { error: 'RPC not available' }
        };
      }
    } catch (error) {
      console.error('🔍 Error testing auth:', error);
      return { error };
    }
  };

  const handleRefreshSession = async () => {
    console.log('🔄 Manual session refresh triggered');
    await refreshSession();
  };

  return (
    <ProductionSecurityGuard>
      <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg z-50">
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