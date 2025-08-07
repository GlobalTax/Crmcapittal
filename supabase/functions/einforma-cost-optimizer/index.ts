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

    console.log('💰 Starting eInforma cost optimization analysis');

    // Get cost limits configuration
    const { data: config } = await supabase
      .from('einforma_config')
      .select('config_value')
      .eq('config_key', 'cost_limits')
      .single();

    const costLimits = config?.config_value as any || {};
    const monthlyBudget = costLimits.monthly_budget || 5000;
    const alertThreshold = costLimits.alert_at_80_percent ? 0.8 : 0.9;

    // Get current month's spending
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const { data: monthlyCosts, error: costsError } = await supabase
      .from('einforma_cost_tracking')
      .select('*')
      .gte('consultation_date', currentMonth.toISOString())
      .lt('consultation_date', nextMonth.toISOString())
      .order('consultation_date', { ascending: false });

    if (costsError) {
      console.error('Error fetching cost data:', costsError);
      throw costsError;
    }

    const totalSpent = monthlyCosts?.reduce((sum, cost) => sum + Number(cost.cost_amount), 0) || 0;
    const percentageUsed = (totalSpent / monthlyBudget) * 100;

    console.log(`Current month spending: €${totalSpent} / €${monthlyBudget} (${percentageUsed.toFixed(1)}%)`);

    // Check for budget alerts
    const alerts = [];
    if (percentageUsed >= alertThreshold * 100) {
      const { data: alert, error: alertError } = await supabase
        .from('einforma_alerts')
        .insert({
          alert_type: 'budget_warning',
          severity: percentageUsed >= 100 ? 'critical' : 'high',
          title: `Alerta de Presupuesto eInforma`,
          message: `Consumido ${percentageUsed.toFixed(1)}% del presupuesto mensual (€${totalSpent}/€${monthlyBudget})`,
          user_id: (await supabase.from('user_roles').select('user_id').eq('role', 'admin').limit(1).single())?.data?.user_id,
          alert_data: {
            total_spent: totalSpent,
            monthly_budget: monthlyBudget,
            percentage_used: percentageUsed,
            remaining_budget: monthlyBudget - totalSpent
          }
        })
        .select()
        .single();

      if (!alertError) {
        alerts.push(alert);
        console.log(`🚨 Budget alert created: ${percentageUsed.toFixed(1)}% used`);
      }
    }

    // Analyze duplicate consultations (cost optimization opportunity)
    const duplicateAnalysis = await this.findDuplicateConsultations(supabase, monthlyCosts || []);
    
    // Analyze bulk operation opportunities
    const bulkOpportunities = await this.findBulkOpportunities(supabase, monthlyCosts || []);
    
    // Cost prediction based on historical data
    const costPrediction = await this.predictFutureCosts(supabase, monthlyCosts || []);
    
    // Generate optimization recommendations
    const recommendations = this.generateOptimizationRecommendations({
      totalSpent,
      monthlyBudget,
      percentageUsed,
      duplicateAnalysis,
      bulkOpportunities,
      costPrediction
    });

    // Calculate potential savings
    const potentialSavings = duplicateAnalysis.potentialSavings + bulkOpportunities.potentialSavings;

    const optimizationReport = {
      budget_analysis: {
        monthly_budget: monthlyBudget,
        total_spent: totalSpent,
        percentage_used: percentageUsed,
        remaining_budget: monthlyBudget - totalSpent,
        alert_threshold: alertThreshold * 100
      },
      duplicate_analysis: duplicateAnalysis,
      bulk_opportunities: bulkOpportunities,
      cost_prediction: costPrediction,
      potential_savings: potentialSavings,
      recommendations,
      alerts_created: alerts.length
    };

    // Store analytics
    await supabase
      .from('einforma_analytics')
      .insert({
        metric_type: 'cost_efficiency',
        metric_value: potentialSavings,
        additional_data: optimizationReport
      });

    console.log(`✨ Cost optimization completed: €${potentialSavings.toFixed(2)} potential savings identified`);

    return new Response(
      JSON.stringify({
        success: true,
        report: optimizationReport
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in cost optimization:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    );
  }
});

async function findDuplicateConsultations(supabase: any, costs: any[]): Promise<any> {
  const nifCounts = costs.reduce((acc, cost) => {
    const nif = cost.request_data?.nif;
    if (nif) {
      acc[nif] = (acc[nif] || 0) + 1;
    }
    return acc;
  }, {});

  const duplicates = Object.entries(nifCounts).filter(([_, count]) => (count as number) > 1);
  const duplicateCosts = duplicates.reduce((total, [nif, count]) => {
    const costPerConsultation = costs.find(c => c.request_data?.nif === nif)?.cost_amount || 0;
    return total + (costPerConsultation * ((count as number) - 1));
  }, 0);

  return {
    duplicate_consultations: duplicates.length,
    duplicate_nifs: duplicates.map(([nif]) => nif),
    potentialSavings: duplicateCosts,
    recommendations: duplicates.length > 0 ? 
      ['Implementar cache de consultas para evitar duplicados'] : []
  };
}

async function findBulkOpportunities(supabase: any, costs: any[]): Promise<any> {
  // Get bulk discount configuration
  const { data: config } = await supabase
    .from('einforma_config')
    .select('config_value')
    .eq('config_key', 'bulk_discounts')
    .single();

  const bulkDiscounts = config?.config_value as any || {};
  
  const individualConsultations = costs.filter(c => !c.is_bulk_operation);
  const totalIndividualCost = individualConsultations.reduce((sum, cost) => sum + Number(cost.cost_amount), 0);
  
  let potentialSavings = 0;
  let recommendedTier = null;

  // Check if bulk discounts would apply
  if (individualConsultations.length >= bulkDiscounts.tier_2?.min_queries) {
    potentialSavings = totalIndividualCost * bulkDiscounts.tier_2.discount;
    recommendedTier = 'tier_2';
  } else if (individualConsultations.length >= bulkDiscounts.tier_1?.min_queries) {
    potentialSavings = totalIndividualCost * bulkDiscounts.tier_1.discount;
    recommendedTier = 'tier_1';
  }

  return {
    individual_consultations: individualConsultations.length,
    total_individual_cost: totalIndividualCost,
    recommended_tier: recommendedTier,
    potentialSavings,
    recommendations: potentialSavings > 0 ? 
      [`Agrupar consultas individuales para obtener ${(bulkDiscounts[recommendedTier]?.discount * 100)}% descuento`] : []
  };
}

async function predictFutureCosts(supabase: any, costs: any[]): Promise<any> {
  const dailyCosts = costs.reduce((acc, cost) => {
    const date = cost.consultation_date.split('T')[0];
    acc[date] = (acc[date] || 0) + Number(cost.cost_amount);
    return acc;
  }, {});

  const sortedDates = Object.keys(dailyCosts).sort();
  const recentDays = sortedDates.slice(-7); // Last 7 days
  const averageDailyCost = recentDays.reduce((sum, date) => sum + dailyCosts[date], 0) / recentDays.length;

  const daysRemainingInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const predictedRemainingCost = averageDailyCost * daysRemainingInMonth;

  return {
    average_daily_cost: averageDailyCost,
    days_remaining_in_month: daysRemainingInMonth,
    predicted_remaining_cost: predictedRemainingCost,
    predicted_total_month: costs.reduce((sum, cost) => sum + Number(cost.cost_amount), 0) + predictedRemainingCost
  };
}

function generateOptimizationRecommendations(analysis: any): string[] {
  const recommendations = [];

  if (analysis.percentageUsed > 80) {
    recommendations.push('Presupuesto casi agotado. Revisar prioridades de consultas.');
  }

  if (analysis.duplicateAnalysis.potentialSavings > 0) {
    recommendations.push(`Eliminar ${analysis.duplicateAnalysis.duplicate_consultations} consultas duplicadas podría ahorrar €${analysis.duplicateAnalysis.potentialSavings.toFixed(2)}`);
  }

  if (analysis.bulkOpportunities.potentialSavings > 0) {
    recommendations.push(`Usar operaciones bulk podría ahorrar €${analysis.bulkOpportunities.potentialSavings.toFixed(2)}`);
  }

  if (analysis.costPrediction.predicted_total_month > analysis.monthlyBudget) {
    recommendations.push('La predicción sugiere que se excederá el presupuesto mensual. Considerar ajustar la estrategia.');
  }

  if (recommendations.length === 0) {
    recommendations.push('El uso del presupuesto está dentro de los parámetros óptimos.');
  }

  return recommendations;
}