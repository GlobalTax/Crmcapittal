import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EInformaMetrics {
  totalQueries: number;
  queriesChange: number;
  companiesEnriched: number;
  companiesChange: number;
  totalCost: number;
  costChange: number;
  riskAlerts: number;
  riskChange: number;
}

interface UsageData {
  month: string;
  queries: number;
  cost: number;
  companies: number;
}

interface RecentQuery {
  companyName: string;
  nif: string;
  status: 'success' | 'error';
  timestamp: string;
  cost: number;
}

interface CompanyInsight {
  sector: string;
  totalCompanies: number;
  averageRevenue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface RiskAlert {
  companyId: string;
  companyName: string;
  riskType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
}

export const useEInformaDashboard = () => {
  const [metrics, setMetrics] = useState<EInformaMetrics>({
    totalQueries: 0,
    queriesChange: 0,
    companiesEnriched: 0,
    companiesChange: 0,
    totalCost: 0,
    costChange: 0,
    riskAlerts: 0,
    riskChange: 0
  });

  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [companyInsights, setCompanyInsights] = useState<CompanyInsight[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadUsageData(),
        loadRecentQueries(),
        loadCompanyInsights(),
        loadRiskAlerts()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Obtener total de enriquecimientos
      const { count: totalEnrichments } = await supabase
        .from('company_enrichments')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'einforma');

      // Obtener empresas únicas enriquecidas
      const { data: uniqueCompanies } = await supabase
        .from('company_enrichments')
        .select('company_id')
        .eq('source', 'einforma');

      const uniqueCompaniesCount = new Set(uniqueCompanies?.map(c => c.company_id)).size;

      // Obtener datos del mes anterior para comparación
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { count: lastMonthEnrichments } = await supabase
        .from('company_enrichments')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'einforma')
        .gte('created_at', lastMonth.toISOString());

      // Calcular métricas simuladas (en un entorno real se calcularían desde logs reales)
      const queriesChange = lastMonthEnrichments ? 
        ((totalEnrichments || 0) - lastMonthEnrichments) / lastMonthEnrichments * 100 : 0;

      setMetrics({
        totalQueries: totalEnrichments || 0,
        queriesChange: Math.round(queriesChange),
        companiesEnriched: uniqueCompaniesCount,
        companiesChange: Math.round(queriesChange * 0.8), // Simulado
        totalCost: Math.round((totalEnrichments || 0) * 0.15), // €0.15 por consulta estimado
        costChange: Math.round(queriesChange * 0.15),
        riskAlerts: Math.floor((uniqueCompaniesCount || 0) * 0.1), // 10% tienen alertas de riesgo
        riskChange: -5 // Simulado
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadUsageData = async () => {
    try {
      // Generar datos de los últimos 6 meses
      const months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const { count } = await supabase
          .from('company_enrichments')
          .select('*', { count: 'exact', head: true })
          .eq('source', 'einforma')
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());

        months.push({
          month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          queries: count || 0,
          cost: Math.round((count || 0) * 0.15),
          companies: Math.round((count || 0) * 0.8) // Simulado
        });
      }

      setUsageData(months);
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
  };

  const loadRecentQueries = async () => {
    try {
      const { data } = await supabase
        .from('company_enrichments')
        .select('*')
        .eq('source', 'einforma')
        .order('created_at', { ascending: false })
        .limit(10);

      // Simular datos de consultas recientes
      const queries: RecentQuery[] = (data || []).map((enrichment, index) => ({
        companyName: `Empresa ${index + 1}`,
        nif: `B${String(12345678 + index).padStart(8, '0')}`,
        status: enrichment.confidence_score && enrichment.confidence_score > 0.5 ? 'success' : 'error',
        timestamp: enrichment.created_at,
        cost: 0.15
      }));

      setRecentQueries(queries);
    } catch (error) {
      console.error('Error loading recent queries:', error);
    }
  };

  const loadCompanyInsights = async () => {
    try {
      const { data } = await supabase
        .from('companies')
        .select('industry, annual_revenue')
        .not('industry', 'is', null);

      // Agrupar por sector
      const sectorMap = new Map<string, { count: number; totalRevenue: number }>();
      
      data?.forEach(company => {
        if (company.industry) {
          const existing = sectorMap.get(company.industry) || { count: 0, totalRevenue: 0 };
          sectorMap.set(company.industry, {
            count: existing.count + 1,
            totalRevenue: existing.totalRevenue + (company.annual_revenue || 0)
          });
        }
      });

      const insights: CompanyInsight[] = Array.from(sectorMap.entries()).map(([sector, data]) => ({
        sector,
        totalCompanies: data.count,
        averageRevenue: Math.round(data.totalRevenue / data.count),
        riskLevel: data.count > 10 ? 'low' : data.count > 5 ? 'medium' : 'high'
      }));

      setCompanyInsights(insights.slice(0, 10)); // Top 10 sectores
    } catch (error) {
      console.error('Error loading company insights:', error);
    }
  };

  const loadRiskAlerts = async () => {
    try {
      // En un entorno real, esto vendría de un análisis más sofisticado
      const { data } = await supabase
        .from('companies')
        .select('id, name, annual_revenue, founded_year')
        .not('annual_revenue', 'is', null)
        .order('annual_revenue', { ascending: true })
        .limit(5);

      const alerts: RiskAlert[] = (data || []).map(company => ({
        companyId: company.id,
        companyName: company.name,
        riskType: 'financial',
        severity: company.annual_revenue && company.annual_revenue < 100000 ? 'high' : 'medium',
        description: `Ingresos anuales bajos: €${company.annual_revenue?.toLocaleString('es-ES')}`,
        timestamp: new Date().toISOString()
      }));

      setRiskAlerts(alerts);
    } catch (error) {
      console.error('Error loading risk alerts:', error);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    metrics,
    usageData,
    recentQueries,
    companyInsights,
    riskAlerts,
    isLoading,
    refreshData
  };
};