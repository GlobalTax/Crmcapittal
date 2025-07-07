import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/Lead';
import { Deal } from '@/types/Deal';

export interface AlertData {
  id: string;
  type: 'lead_not_contacted' | 'lead_stagnant' | 'deal_inactive';
  title: string;
  description: string;
  count: number;
  severity: 'critical' | 'warning' | 'info';
  leadIds?: string[];
  dealIds?: string[];
  action?: string;
}

export const useIntelligentAlerts = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAlerts, setTotalAlerts] = useState(0);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Alerta 1: Leads no contactados en 24h
      const { data: uncontactedLeads } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'NEW')
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Alerta 2: Leads estancados >5 días
      const { data: stagnantLeads } = await supabase
        .from('leads')
        .select('*')
        .not('status', 'in', '(QUALIFIED,DISQUALIFIED)')
        .lt('updated_at', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString());

      // Alerta 3: Deals sin actividad reciente
      const { data: inactiveDeals } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .or(`next_activity.is.null,updated_at.lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`);

      const alertsData: AlertData[] = [];

      // Procesar alertas
      if (uncontactedLeads && uncontactedLeads.length > 0) {
        alertsData.push({
          id: 'uncontacted_leads',
          type: 'lead_not_contacted',
          title: 'Leads sin contactar',
          description: `${uncontactedLeads.length} leads creados hace más de 24h sin contacto inicial`,
          count: uncontactedLeads.length,
          severity: 'critical',
          leadIds: uncontactedLeads.map(lead => lead.id),
          action: 'contact_immediately'
        });
      }

      if (stagnantLeads && stagnantLeads.length > 0) {
        alertsData.push({
          id: 'stagnant_leads',
          type: 'lead_stagnant',
          title: 'Leads estancados',
          description: `${stagnantLeads.length} leads sin actividad en más de 5 días`,
          count: stagnantLeads.length,
          severity: 'warning',
          leadIds: stagnantLeads.map(lead => lead.id),
          action: 'follow_up_required'
        });
      }

      if (inactiveDeals && inactiveDeals.length > 0) {
        alertsData.push({
          id: 'inactive_deals',
          type: 'deal_inactive',
          title: 'Oportunidades inactivas',
          description: `${inactiveDeals.length} oportunidades sin actividad reciente`,
          count: inactiveDeals.length,
          severity: 'warning',
          dealIds: inactiveDeals.map(deal => deal.id),
          action: 'schedule_activity'
        });
      }

      setAlerts(alertsData);
      setTotalAlerts(alertsData.reduce((sum, alert) => sum + alert.count, 0));
    } catch (error) {
      console.error('Error fetching intelligent alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    alerts,
    loading,
    totalAlerts,
    refetch: fetchAlerts
  };
};