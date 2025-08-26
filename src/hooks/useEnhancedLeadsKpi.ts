import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedLeadsKpiData {
  totalLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  newLeads30d: number;
  newLeads7d: number;
  avgScore: number;
  pipelineValue: number;
  conversionRate: number;
  growthRate30d: number;
  avgTimeToQualifyDays: number;
  leadsTrend: 'up' | 'down' | 'stable';
  conversionTrendData: Array<{
    week: string;
    conversion_rate: number;
  }>;
}

export interface EnhancedLeadsFunnelData {
  stageId: string;
  stageName: string;
  stageOrder: number;
  stageColor: string | null;
  leadCount: number;
  avgScore: number;
  recentCount: number;
  stageConversionRate: number;
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
}

export const useEnhancedLeadsKpi = () => {
  const [kpis, setKpis] = useState<EnhancedLeadsKpiData>({
    totalLeads: 0,
    qualifiedLeads: 0,
    hotLeads: 0,
    newLeads30d: 0,
    newLeads7d: 0,
    avgScore: 0,
    pipelineValue: 0,
    conversionRate: 0,
    growthRate30d: 0,
    avgTimeToQualifyDays: 0,
    leadsTrend: 'stable',
    conversionTrendData: [],
  });
  
  const [funnelData, setFunnelData] = useState<EnhancedLeadsFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch enhanced KPIs data from leads table directly (fallback)
        const { data: kpiData, error: kpiError } = await supabase
          .from('leads')
          .select('id, probability, created_at, lead_score');

        if (kpiError) throw kpiError;

        // Fetch enhanced funnel data
        const { data: funnel, error: funnelError } = await supabase
          .from('vw_leads_funnel')
          .select('*')
          .order('stage_count', { ascending: false });

        if (funnelError) throw funnelError;

        // Calculate enhanced KPIs from array data
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const totalLeads = kpiData?.length || 0;
        const qualifiedLeads = kpiData?.filter(lead => (lead.probability || 0) > 70).length || 0;
        const newLeads30d = kpiData?.filter(lead => new Date(lead.created_at) >= thirtyDaysAgo).length || 0;
        const newLeads7d = kpiData?.filter(lead => new Date(lead.created_at) >= sevenDaysAgo).length || 0;
        const avgScore = kpiData?.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / totalLeads || 0;
        const avgProbConversion = kpiData?.reduce((sum, lead) => sum + (lead.probability || 0), 0) / totalLeads || 0;

        setKpis({
          totalLeads,
          qualifiedLeads,
          hotLeads: qualifiedLeads,
          newLeads30d,
          newLeads7d,
          avgScore,
          pipelineValue: totalLeads * 1000,
          conversionRate: avgProbConversion,
          growthRate30d: totalLeads > 0 ? (newLeads30d / totalLeads) * 100 : 0,
          avgTimeToQualifyDays: 7, // Default average time
          leadsTrend: 'stable' as 'up' | 'down' | 'stable',
          conversionTrendData: [], // Empty array for now
        });

        setFunnelData(funnel?.map((item, idx) => ({
          stageId: item.pipeline_stage_id,
          stageName: item.stage_label,
          stageOrder: idx, // derived order
          stageColor: null,
          leadCount: item.stage_count,
          avgScore: 0,
          recentCount: 0,
          stageConversionRate: item.stage_percent || 0,
          performanceRating: 'average',
        })) || []);

      } catch (err) {
        console.error('Error fetching enhanced leads KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching leads KPIs');
        
        // Fallback data
        setKpis({
          totalLeads: 0,
          qualifiedLeads: 0,
          hotLeads: 0,
          newLeads30d: 0,
          newLeads7d: 0,
          avgScore: 0,
          pipelineValue: 0,
          conversionRate: 0,
          growthRate30d: 0,
          avgTimeToQualifyDays: 0,
          leadsTrend: 'stable',
          conversionTrendData: [],
        });
        setFunnelData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 2 minutes for real-time updates
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { kpis, funnelData, loading, error };
};