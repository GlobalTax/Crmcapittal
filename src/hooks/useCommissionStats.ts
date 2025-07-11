import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommissionStats {
  pendingAmount: number;
  pendingCount: number;
  pendingTrend: number;
  paidThisMonth: number;
  paidCount: number;
  paidTrend: number;
  activeCollaborators: number;
  collaboratorsTrend: number;
  averageCommission: number;
  averageTrend: number;
  sourceDistribution: Array<{
    type: string;
    amount: number;
    percentage: number;
  }>;
  topCollaborators: Array<{
    id: string;
    name: string;
    type: string;
    amount: number;
    count: number;
  }>;
  alerts: Array<{
    title: string;
    description: string;
    type: 'warning' | 'error' | 'info';
  }>;
}

export const useCommissionStats = () => {
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Obtener comisiones pendientes
        const { data: pendingCommissions } = await supabase
          .from('collaborator_commissions')
          .select('commission_amount')
          .eq('status', 'pending');

        // Obtener comisiones pagadas este mes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: paidCommissions } = await supabase
          .from('collaborator_commissions')
          .select('commission_amount')
          .eq('status', 'paid')
          .gte('paid_at', startOfMonth.toISOString());

        // Obtener colaboradores activos
        const { data: activeCollaborators } = await supabase
          .from('collaborators')
          .select('id')
          .eq('is_active', true);

        // Obtener distribución por fuente
        const { data: commissionsBySource } = await supabase
          .from('collaborator_commissions')
          .select('source_type, commission_amount')
          .eq('status', 'paid')
          .gte('created_at', startOfMonth.toISOString());

        // Obtener top colaboradores
        const { data: topCollaboratorsData } = await supabase
          .from('collaborator_commissions')
          .select(`
            collaborator_id,
            commission_amount,
            collaborators(name, collaborator_type)
          `)
          .eq('status', 'paid')
          .gte('created_at', startOfMonth.toISOString());

        // Calcular estadísticas
        const pendingAmount = pendingCommissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
        const paidAmount = paidCommissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
        
        // Distribución por fuente
        const sourceMap = new Map();
        commissionsBySource?.forEach(commission => {
          const type = commission.source_type || 'deal';
          const current = sourceMap.get(type) || 0;
          sourceMap.set(type, current + Number(commission.commission_amount));
        });

        const totalSourceAmount = Array.from(sourceMap.values()).reduce((sum, amount) => sum + amount, 0);
        const sourceDistribution = Array.from(sourceMap.entries()).map(([type, amount]) => ({
          type,
          amount,
          percentage: totalSourceAmount > 0 ? Math.round((amount / totalSourceAmount) * 100) : 0
        }));

        // Top colaboradores
        const collaboratorMap = new Map();
        topCollaboratorsData?.forEach(commission => {
          const id = commission.collaborator_id;
          const current = collaboratorMap.get(id) || { 
            id, 
            name: commission.collaborators?.name || 'Sin nombre',
            type: commission.collaborators?.collaborator_type || 'referente',
            amount: 0, 
            count: 0 
          };
          current.amount += Number(commission.commission_amount);
          current.count += 1;
          collaboratorMap.set(id, current);
        });

        const topCollaborators = Array.from(collaboratorMap.values())
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Generar alertas
        const alerts = [];
        if (pendingCommissions && pendingCommissions.length > 10) {
          alerts.push({
            title: 'Muchas comisiones pendientes',
            description: `Hay ${pendingCommissions.length} comisiones pendientes de aprobación`,
            type: 'warning' as const
          });
        }

        setStats({
          pendingAmount,
          pendingCount: pendingCommissions?.length || 0,
          pendingTrend: 0, // TODO: Calcular tendencia
          paidThisMonth: paidAmount,
          paidCount: paidCommissions?.length || 0,
          paidTrend: 0, // TODO: Calcular tendencia
          activeCollaborators: activeCollaborators?.length || 0,
          collaboratorsTrend: 0, // TODO: Calcular tendencia
          averageCommission: activeCollaborators?.length ? paidAmount / activeCollaborators.length : 0,
          averageTrend: 0, // TODO: Calcular tendencia
          sourceDistribution,
          topCollaborators,
          alerts
        });

      } catch (err) {
        console.error('Error fetching commission stats:', err);
        setError('Error al cargar estadísticas de comisiones');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};