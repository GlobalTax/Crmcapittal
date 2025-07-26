import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const AuthDebugPanel: React.FC = () => {
  const { user, session, refreshSession } = useAuth();

  const testAuthUID = async () => {
    try {
      const { data, error } = await supabase.rpc('test_auth_uid');
      console.log('🔍 Testing auth.uid():', { data, error });
      
      // También probar una consulta directa
      const { data: testQuery, error: testError } = await supabase
        .from('companies')
        .select('count')
        .limit(1);
      
      console.log('🔍 Test companies query:', { testQuery, testError });
      
      return { data, error, testQuery, testError };
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
  );
};