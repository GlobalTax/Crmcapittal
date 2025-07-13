import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  database: 'healthy' | 'warning' | 'error';
  hubspot: 'healthy' | 'warning' | 'error';
  email: 'healthy' | 'warning' | 'error';
  lastChecked: Date | null;
}

export const useHealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus>({
    database: 'healthy',
    hubspot: 'healthy', 
    email: 'healthy',
    lastChecked: null
  });

  const checkHealth = async () => {
    const newHealth: HealthStatus = {
      database: 'healthy',
      hubspot: 'healthy',
      email: 'healthy',
      lastChecked: new Date()
    };

    // Check database connectivity
    try {
      await supabase.from('companies').select('count').limit(1).single();
    } catch (error) {
      console.error('Database health check failed:', error);
      newHealth.database = 'error';
    }

    // Check HubSpot integration (basic test)
    try {
      const { error } = await supabase.functions.invoke('hubspot-import', {
        body: { importType: 'test' }
      });
      if (error?.message?.includes('403') || error?.message?.includes('permission')) {
        newHealth.hubspot = 'warning';
      }
    } catch (error) {
      console.error('HubSpot health check failed:', error);
      newHealth.hubspot = 'error';
    }

    // Check email service (test without sending)
    try {
      // This is a passive check - just verify the function exists
      const { error } = await supabase.functions.invoke('send-tracked-email', {
        body: { test: true }
      });
      if (error && !error.message.includes('test')) {
        newHealth.email = 'warning';
      }
    } catch (error) {
      console.error('Email health check failed:', error);
      newHealth.email = 'error';
    }

    setHealth(newHealth);
  };

  useEffect(() => {
    checkHealth();
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { health, checkHealth };
};