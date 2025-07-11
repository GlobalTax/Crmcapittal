import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserCollaborator } from '@/hooks/useUserCollaborator';

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
  const { role } = useUserRole();
  const { collaborator } = useUserCollaborator();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const isAdmin = role === 'admin' || role === 'superadmin';
        
        // Base queries for commissions
        let pendingQuery = supabase
          .from('collaborator_commissions')
          .select('commission_amount')
          .eq('status', 'pending');
          
        let paidQuery = supabase
          .from('collaborator_commissions')
          .select('commission_amount')
          .eq('status', 'paid');

        // Filter by collaborator for non-admin users
        if (!isAdmin && collaborator?.id) {
          pendingQuery = pendingQuery.eq('collaborator_id', collaborator.id);
          paidQuery = paidQuery.eq('collaborator_id', collaborator.id);
        }
        
        // Obtener comisiones pendientes
        const { data: pendingCommissions } = await pendingQuery;

        // Obtener comisiones pagadas este mes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: paidCommissions } = await paidQuery
          .gte('paid_at', startOfMonth.toISOString());

        // Obtener colaboradores activos (solo para admins)
        let activeCollaboratorsCount = 1; // Default for individual users
        if (isAdmin) {
          const { data: activeCollaborators } = await supabase
            .from('collaborators')
            .select('id')
            .eq('is_active', true);
          activeCollaboratorsCount = activeCollaborators?.length || 0;
        }

        // Obtener distribución por fuente
        let sourceQuery = supabase
          .from('collaborator_commissions')
          .select('source_type, commission_amount')
          .eq('status', 'paid')
          .gte('created_at', startOfMonth.toISOString());
          
        if (!isAdmin && collaborator?.id) {
          sourceQuery = sourceQuery.eq('collaborator_id', collaborator.id);
        }
        
        const { data: commissionsBySource } = await sourceQuery;

        // Obtener top colaboradores (solo para admins)
        let topCollaboratorsData = [];
        if (isAdmin) {
          const { data } = await supabase
            .from('collaborator_commissions')
            .select(`
              collaborator_id,
              commission_amount,
              collaborators(name, collaborator_type)
            `)
            .eq('status', 'paid')
            .gte('created_at', startOfMonth.toISOString());
          topCollaboratorsData = data || [];
        }

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

        // Top colaboradores (solo para admins)
        let topCollaborators = [];
        if (isAdmin) {
          const collaboratorMap = new Map();
          topCollaboratorsData.forEach(commission => {
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

          topCollaborators = Array.from(collaboratorMap.values())
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
        }

        // Generar alertas
        const alerts = [];
        const alertThreshold = isAdmin ? 10 : 3; // Lower threshold for individual users
        if (pendingCommissions && pendingCommissions.length > alertThreshold) {
          const alertTitle = isAdmin ? 'Muchas comisiones pendientes' : 'Comisiones pendientes de aprobación';
          const alertDescription = isAdmin 
            ? `Hay ${pendingCommissions.length} comisiones pendientes de aprobación`
            : `Tienes ${pendingCommissions.length} comisiones pendientes de aprobación`;
          alerts.push({
            title: alertTitle,
            description: alertDescription,
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
          activeCollaborators: activeCollaboratorsCount,
          collaboratorsTrend: 0, // TODO: Calcular tendencia
          averageCommission: activeCollaboratorsCount ? paidAmount / activeCollaboratorsCount : paidAmount,
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

    if (role !== undefined && (role === 'admin' || role === 'superadmin' || collaborator)) {
      fetchStats();
    }
  }, [role, collaborator]);

  return { stats, loading, error };
};