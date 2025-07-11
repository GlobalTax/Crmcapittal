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
  collaboratorStats: {
    totalAmount: number;
    count: number;
  };
  employeeStats: {
    totalAmount: number;
    count: number;
  };
  advancedCalculations: {
    percentage: number;
    count: number;
  };
  lowMarginAlerts: Array<{
    title: string;
    description: string;
    commissionId: string;
    margin: number;
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
          .from('commissions')
          .select('commission_amount')
          .eq('status', 'pending');
          
        let paidQuery = supabase
          .from('commissions')
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
          .from('commissions')
          .select('source_type, commission_amount')
          .eq('status', 'paid')
          .gte('created_at', startOfMonth.toISOString());
          
        if (!isAdmin && collaborator?.id) {
          sourceQuery = sourceQuery.eq('collaborator_id', collaborator.id);
        }
        
        const { data: commissionsBySource } = await sourceQuery;

        // Obtener todas las comisiones para estadísticas detalladas (solo para admins)
        let allCommissionsData = [];
        if (isAdmin) {
          const { data } = await supabase
            .from('commissions')
            .select(`
              id,
              collaborator_id,
              employee_id,
              recipient_type,
              recipient_name,
              commission_amount,
              calculation_details,
              collaborators(name, collaborator_type),
              user_profiles(first_name, last_name)
            `)
            .eq('status', 'paid')
            .gte('created_at', startOfMonth.toISOString());
          allCommissionsData = data || [];
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

        // Calcular estadísticas por tipo de destinatario y cálculos avanzados
        let collaboratorStats = { totalAmount: 0, count: 0 };
        let employeeStats = { totalAmount: 0, count: 0 };
        let advancedCalculations = { percentage: 0, count: 0 };
        let lowMarginAlerts = [];
        let topCollaborators = [];

        if (isAdmin) {
          const recipientMap = new Map();
          let advancedCalcCount = 0;
          const totalCalcCount = allCommissionsData.length;
          
          allCommissionsData.forEach(commission => {
            const amount = Number(commission.commission_amount);
            
            // Estadísticas por tipo de destinatario
            if (commission.recipient_type === 'collaborator') {
              collaboratorStats.totalAmount += amount;
              collaboratorStats.count += 1;
            } else {
              employeeStats.totalAmount += amount;
              employeeStats.count += 1;
            }
            
            // Calcular estadísticas de cálculos avanzados
            const calcDetails = commission.calculation_details as any;
            if (calcDetails?.calculationType && calcDetails.calculationType !== 'gross') {
              advancedCalcCount += 1;
              
              // Verificar margen bajo
              if (calcDetails.netProfit && calcDetails.netProfitMargin && calcDetails.netProfitMargin < 20) {
                lowMarginAlerts.push({
                  title: `Margen bajo: ${calcDetails.netProfitMargin.toFixed(1)}%`,
                  description: `Comisión con margen inferior al 20%`,
                  commissionId: commission.id,
                  margin: calcDetails.netProfitMargin
                });
              }
            }
            
            // Top colaboradores/empleados
            const id = commission.recipient_type === 'collaborator' ? commission.collaborator_id : commission.employee_id;
            const recipientKey = `${commission.recipient_type}-${id}`;
            
            let name = commission.recipient_name;
            if (!name) {
              if (commission.recipient_type === 'collaborator') {
                name = commission.collaborators?.name || 'Sin nombre';
              } else {
                const firstName = commission.user_profiles?.first_name || '';
                const lastName = commission.user_profiles?.last_name || '';
                name = `${firstName} ${lastName}`.trim() || 'Sin nombre';
              }
            }
            
            const current = recipientMap.get(recipientKey) || { 
              id: recipientKey, 
              name,
              type: commission.recipient_type === 'collaborator' 
                ? commission.collaborators?.collaborator_type || 'referente'
                : 'empleado',
              amount: 0, 
              count: 0 
            };
            current.amount += amount;
            current.count += 1;
            recipientMap.set(recipientKey, current);
          });

          advancedCalculations.percentage = totalCalcCount > 0 ? Math.round((advancedCalcCount / totalCalcCount) * 100) : 0;
          advancedCalculations.count = advancedCalcCount;

          topCollaborators = Array.from(recipientMap.values())
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
          alerts,
          collaboratorStats,
          employeeStats,
          advancedCalculations,
          lowMarginAlerts
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