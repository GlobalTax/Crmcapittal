
import { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);

  const checkHealthInternal = async (signal?: AbortSignal) => {
    const newHealth: HealthStatus = {
      database: 'healthy',
      hubspot: 'healthy',
      email: 'healthy',
      lastChecked: new Date()
    };

    // Check database connectivity
    try {
      await supabase.from('companies').select('count').limit(1).abortSignal(signal).single();
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

    // Check email service with proper test request
    try {
      const { data, error } = await supabase.functions.invoke('send-tracked-email', {
        body: { test: true }
      });
      
      if (error) {
        console.error('Email health check failed:', error);
        newHealth.email = 'error';
      } else if (data?.success === true && data?.test === true) {
        newHealth.email = 'healthy';
      } else {
        newHealth.email = 'warning';
      }
    } catch (error) {
      console.error('Email health check failed:', error);
      newHealth.email = 'error';
    }

    if (isMounted.current) {
      setHealth(newHealth);
    }
  };

  // Public API (no-arg) to keep compatibility with UI handlers
  const checkHealth = async () => {
    await checkHealthInternal();
  };

  useEffect(() => {
    const controller = new AbortController();
    checkHealthInternal(controller.signal);
    // Check health every 5 minutes
    const interval = setInterval(() => checkHealthInternal(), 5 * 60 * 1000);
    return () => {
      controller.abort();
      clearInterval(interval);
      isMounted.current = false;
    };
  }, []);

  return { health, checkHealth };
};
