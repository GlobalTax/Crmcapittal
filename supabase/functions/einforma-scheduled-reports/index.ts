import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { report_type = 'weekly' } = await req.json().catch(() => ({}));

    console.log(`📊 Generating ${report_type} eInforma report`);

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (report_type) {
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    console.log(`Report period: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get cost tracking data
    const { data: costData, error: costError } = await supabase
      .from('einforma_cost_tracking')
      .select(`
        *,
        companies(name, industry)
      `)
      .gte('consultation_date', startDate.toISOString())
      .lte('consultation_date', endDate.toISOString())
      .order('consultation_date', { ascending: false });

    if (costError) {
      console.error('Error fetching cost data:', costError);
      throw costError;
    }

    // Get enrichment data
    const { data: enrichmentData, error: enrichmentError } = await supabase
      .from('company_enrichments')
      .select(`
        *,
        companies(name, industry, annual_revenue)
      `)
      .eq('source', 'einforma')
      .gte('enrichment_date', startDate.toISOString())
      .lte('enrichment_date', endDate.toISOString())
      .order('enrichment_date', { ascending: false });

    if (enrichmentError) {
      console.error('Error fetching enrichment data:', enrichmentError);
      throw enrichmentError;
    }

    // Get alerts data
    const { data: alertsData, error: alertsError } = await supabase
      .from('einforma_alerts')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (alertsError) {
      console.error('Error fetching alerts data:', alertsError);
      throw alertsError;
    }

    // Calculate metrics
    const totalCost = costData?.reduce((sum, item) => sum + Number(item.cost_amount), 0) || 0;
    const totalConsultations = costData?.length || 0;
    const totalEnrichments = enrichmentData?.length || 0;
    const totalAlerts = alertsData?.length || 0;

    // Cost by type analysis
    const costByType = costData?.reduce((acc, item) => {
      acc[item.consultation_type] = (acc[item.consultation_type] || 0) + Number(item.cost_amount);
      return acc;
    }, {} as Record<string, number>) || {};

    // Industry analysis
    const industryStats = enrichmentData?.reduce((acc, item) => {
      const industry = item.companies?.industry || 'Unknown';
      if (!acc[industry]) {
        acc[industry] = { count: 0, totalRevenue: 0 };
      }
      acc[industry].count++;
      acc[industry].totalRevenue += item.companies?.annual_revenue || 0;
      return acc;
    }, {} as Record<string, { count: number; totalRevenue: number }>) || {};

    // Risk analysis
    const riskAlerts = alertsData?.filter(alert => alert.alert_type === 'risk_change') || [];
    const highRiskAlerts = riskAlerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical');

    // ROI calculation (simplified)
    const averageRevenueEnriched = Object.values(industryStats).reduce((sum, stat) => 
      sum + (stat.totalRevenue / Math.max(stat.count, 1)), 0) / Math.max(Object.keys(industryStats).length, 1);
    
    const estimatedROI = totalCost > 0 ? (averageRevenueEnriched * 0.05) / totalCost : 0; // 5% conversion assumption

    // Cost predictions for next period
    const avgDailyCost = totalCost / Math.max((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24), 1);
    const predictedNextPeriodCost = avgDailyCost * (report_type === 'weekly' ? 7 : 30);

    // Efficiency metrics
    const costEfficiency = totalConsultations > 0 ? totalCost / totalConsultations : 0;
    const enrichmentRate = totalConsultations > 0 ? (totalEnrichments / totalConsultations) * 100 : 0;

    const report = {
      period: {
        type: report_type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        generated_at: now.toISOString()
      },
      summary: {
        total_cost: totalCost,
        total_consultations: totalConsultations,
        total_enrichments: totalEnrichments,
        total_alerts: totalAlerts,
        high_risk_alerts: highRiskAlerts.length,
        average_cost_per_consultation: costEfficiency,
        enrichment_success_rate: enrichmentRate
      },
      cost_analysis: {
        by_type: costByType,
        predicted_next_period: predictedNextPeriodCost,
        daily_average: avgDailyCost,
        efficiency_score: costEfficiency
      },
      industry_insights: industryStats,
      risk_analysis: {
        total_risk_alerts: riskAlerts.length,
        high_risk_companies: highRiskAlerts.length,
        risk_trend: riskAlerts.length > 0 ? 'increasing' : 'stable'
      },
      roi_metrics: {
        estimated_roi: estimatedROI,
        average_company_revenue: averageRevenueEnriched,
        conversion_assumption: 0.05
      },
      recommendations: this.generateRecommendations({
        totalCost,
        costEfficiency,
        enrichmentRate,
        riskAlerts: riskAlerts.length,
        industryStats
      })
    };

    // Store report in database
    await supabase
      .from('einforma_analytics')
      .insert({
        metric_type: 'cost_efficiency',
        metric_value: costEfficiency,
        additional_data: report
      });

    console.log(`✨ ${report_type} report generated: €${totalCost} cost, ${totalConsultations} consultations, ${totalAlerts} alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        report
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    );
  }
});

function generateRecommendations(metrics: any): string[] {
  const recommendations = [];
  
  if (metrics.costEfficiency > 5) {
    recommendations.push('Considerar optimizar las consultas para reducir el coste medio por consulta');
  }
  
  if (metrics.enrichmentRate < 80) {
    recommendations.push('Mejorar la calidad de los datos de entrada para aumentar la tasa de éxito');
  }
  
  if (metrics.riskAlerts > 10) {
    recommendations.push('Revisar las empresas con alertas de riesgo y considerar acciones preventivas');
  }
  
  const topIndustry = Object.entries(metrics.industryStats)
    .sort(([,a], [,b]) => (b as any).count - (a as any).count)[0];
  
  if (topIndustry) {
    recommendations.push(`Sector con más actividad: ${topIndustry[0]}. Considerar estrategias específicas.`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('El sistema funciona de manera óptima. Continuar con la estrategia actual.');
  }
  
  return recommendations;
}