/**
 * Dashboard Service
 * 
 * Service for handling executive dashboard data processing and metrics
 */

export interface EnhancedMetrics {
  performanceTrends: Array<{
    date: string;
    amount: number;
    count: number;
    avg: number;
  }>;
  sourceData: Array<{
    source: string;
    amount: number;
    count: number;
  }>;
  statusData: Array<{
    status: string;
    amount: number;
    count: number;
  }>;
  collaboratorData: Array<{
    name: string;
    amount: number;
    count: number;
  }>;
}

export interface DashboardStats {
  totalAmount: number;
  totalCount: number;
  avgAmount: number;
  growth: number;
  efficiency: number;
  conversion: number;
}

export class DashboardService {
  /**
   * Calculate enhanced metrics from commission data
   */
  static calculateEnhancedMetrics(commissions: any[]): EnhancedMetrics {
    // Performance trends by month
    const monthlyTrends = commissions.reduce((acc, commission) => {
      const month = new Date(commission.created_at).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { date: month, amount: 0, count: 0 };
      }
      acc[month].amount += commission.commission_amount || 0;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);

    const performanceTrends = (Object.values(monthlyTrends) as Array<{ date: string; amount: number; count: number }>)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(trend => ({
        ...trend,
        avg: trend.count > 0 ? trend.amount / trend.count : 0
      }));

    // Source distribution
    const sourceBreakdown = commissions.reduce((acc, commission) => {
      const source = commission.source_name || commission.source_type || 'Desconocido';
      if (!acc[source]) {
        acc[source] = { source, amount: 0, count: 0 };
      }
      acc[source].amount += commission.commission_amount || 0;
      acc[source].count += 1;
      return acc;
    }, {} as Record<string, { source: string; amount: number; count: number }>);

    const sourceData = Object.values(sourceBreakdown) as Array<{ source: string; amount: number; count: number }>;

    // Status distribution
    const statusBreakdown = commissions.reduce((acc, commission) => {
      const status = commission.status || 'pending';
      if (!acc[status]) {
        acc[status] = { status, amount: 0, count: 0 };
      }
      acc[status].amount += commission.commission_amount || 0;
      acc[status].count += 1;
      return acc;
    }, {} as Record<string, { status: string; amount: number; count: number }>);

    const statusData = Object.values(statusBreakdown) as Array<{ status: string; amount: number; count: number }>;

    // Top collaborators
    const collaboratorBreakdown = commissions.reduce((acc, commission) => {
      const name = commission.recipient_name || 
                   commission.collaborators?.name || 
                   `${commission.user_profiles?.first_name || ''} ${commission.user_profiles?.last_name || ''}`.trim() || 
                   'N/A';
      
      if (!acc[name]) {
        acc[name] = { name, amount: 0, count: 0 };
      }
      acc[name].amount += commission.commission_amount || 0;
      acc[name].count += 1;
      return acc;
    }, {} as Record<string, { name: string; amount: number; count: number }>);

    const collaboratorData = (Object.values(collaboratorBreakdown) as Array<{ name: string; amount: number; count: number }>)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return {
      performanceTrends,
      sourceData,
      statusData,
      collaboratorData
    };
  }

  /**
   * Calculate dashboard statistics
   */
  static calculateDashboardStats(commissions: any[]): DashboardStats {
    const totalAmount = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const totalCount = commissions.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    // Calculate growth (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recent = commissions.filter(c => new Date(c.created_at) >= last30Days);
    const previous = commissions.filter(c => {
      const date = new Date(c.created_at);
      return date >= previous30Days && date < last30Days;
    });

    const recentAmount = recent.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const previousAmount = previous.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    
    const growth = previousAmount > 0 ? ((recentAmount - previousAmount) / previousAmount) * 100 : 0;

    // Calculate efficiency (mock calculation)
    const paidCommissions = commissions.filter(c => c.status === 'paid');
    const efficiency = totalCount > 0 ? (paidCommissions.length / totalCount) * 100 : 0;

    // Calculate conversion rate (mock calculation)
    const conversion = totalCount > 0 ? Math.min(efficiency * 1.2, 100) : 0;

    return {
      totalAmount,
      totalCount,
      avgAmount,
      growth,
      efficiency,
      conversion
    };
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Get trend indicator
   */
  static getTrendIndicator(value: number): 'up' | 'down' | 'stable' {
    if (value > 5) return 'up';
    if (value < -5) return 'down';
    return 'stable';
  }

  /**
   * Get performance color based on value and thresholds
   */
  static getPerformanceColor(value: number, thresholds: { good: number; warning: number }): string {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  }
}