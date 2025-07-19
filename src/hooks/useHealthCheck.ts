
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
    console.log('🔍 Iniciando verificación de salud del sistema...');
    
    const newHealth: HealthStatus = {
      database: 'healthy',
      hubspot: 'healthy',
      email: 'healthy',
      lastChecked: new Date()
    };

    // Check database connectivity
    try {
      console.log('🗄️ Verificando conexión a base de datos...');
      const { error } = await supabase.from('companies').select('count').limit(1);
      if (error) {
        console.error('❌ Error en base de datos:', error);
        newHealth.database = 'error';
      } else {
        console.log('✅ Base de datos conectada correctamente');
      }
    } catch (error) {
      console.error('❌ Excepción en verificación de base de datos:', error);
      newHealth.database = 'error';
    }

    // Check HubSpot integration (basic test)
    try {
      console.log('🔗 Verificando integración HubSpot...');
      const { error } = await supabase.functions.invoke('hubspot-import', {
        body: { importType: 'test' }
      });
      if (error?.message?.includes('403') || error?.message?.includes('permission')) {
        console.warn('⚠️ HubSpot: problema de permisos');
        newHealth.hubspot = 'warning';
      } else if (error) {
        console.error('❌ HubSpot: error de conexión', error);
        newHealth.hubspot = 'error';
      } else {
        console.log('✅ HubSpot conectado correctamente');
      }
    } catch (error) {
      console.error('❌ Excepción en verificación de HubSpot:', error);
      newHealth.hubspot = 'error';
    }

    // Check email service (improved test without database insertion)
    try {
      console.log('📧 Verificando servicio de email...');
      const { data, error } = await supabase.functions.invoke('send-tracked-email', {
        body: { test: true } // Only test flag, no email data
      });
      
      if (error) {
        console.error('❌ Email: error en función', error);
        newHealth.email = 'error';
      } else if (data && !data.success) {
        console.warn('⚠️ Email: servicio no configurado');
        newHealth.email = 'warning';
      } else {
        console.log('✅ Servicio de email configurado correctamente');
      }
    } catch (error) {
      console.error('❌ Excepción en verificación de email:', error);
      newHealth.email = 'error';
    }

    console.log('📊 Verificación completada:', {
      database: newHealth.database,
      hubspot: newHealth.hubspot,
      email: newHealth.email
    });

    setHealth(newHealth);
  };

  useEffect(() => {
    checkHealth();
    // Check health every 10 minutes (reduced frequency)
    const interval = setInterval(checkHealth, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { health, checkHealth };
};
