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

    console.log('🔍 Starting eInforma risk monitoring');

    // Get risk monitoring configuration
    const { data: config } = await supabase
      .from('einforma_config')
      .select('config_value')
      .eq('config_key', 'risk_monitoring')
      .single();

    const riskConfig = config?.config_value as any;
    if (!riskConfig?.enabled) {
      console.log('Risk monitoring disabled');
      return new Response(
        JSON.stringify({ message: 'Risk monitoring disabled' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get companies with recent enrichments to monitor
    const { data: enrichments, error: enrichmentsError } = await supabase
      .from('company_enrichments')
      .select(`
        id, company_id, enrichment_data, enrichment_date,
        companies(id, name, nif, created_by, owner_id)
      `)
      .eq('source', 'einforma')
      .gte('enrichment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('enrichment_date', { ascending: false });

    if (enrichmentsError) {
      console.error('Error fetching enrichments:', enrichmentsError);
      throw enrichmentsError;
    }

    console.log(`Monitoring ${enrichments?.length || 0} recent enrichments`);

    const alertsCreated = [];
    const riskChanges = [];

    for (const enrichment of enrichments || []) {
      try {
        const enrichmentData = enrichment.enrichment_data as any;
        const company = enrichment.companies;
        
        if (!company || !enrichmentData) continue;

        // Extract risk indicators from enrichment data
        const creditInfo = enrichmentData.credit_data || enrichmentData.financial_data?.[0];
        const currentRisk = this.calculateRiskScore(creditInfo);
        
        // Get previous enrichment for comparison
        const { data: previousEnrichment } = await supabase
          .from('company_enrichments')
          .select('enrichment_data')
          .eq('company_id', company.id)
          .eq('source', 'einforma')
          .lt('enrichment_date', enrichment.enrichment_date)
          .order('enrichment_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        let riskChanged = false;
        let previousRisk = 'unknown';

        if (previousEnrichment) {
          const prevData = previousEnrichment.enrichment_data as any;
          const prevCreditInfo = prevData.credit_data || prevData.financial_data?.[0];
          previousRisk = this.calculateRiskScore(prevCreditInfo);
          riskChanged = currentRisk !== previousRisk;
        }

        // Check for high risk situations
        const isHighRisk = currentRisk === 'high' || currentRisk === 'critical';
        const riskIncreased = this.getRiskLevel(currentRisk) > this.getRiskLevel(previousRisk);

        if (riskChanged || isHighRisk) {
          console.log(`🚨 Risk alert for ${company.name}: ${previousRisk} → ${currentRisk}`);
          
          const alertSeverity = isHighRisk ? 'high' : (riskIncreased ? 'medium' : 'low');
          const alertMessage = riskChanged 
            ? `Cambio de riesgo detectado: ${previousRisk} → ${currentRisk}`
            : `Empresa en riesgo ${currentRisk}`;

          // Create alert for company owner
          const userId = company.owner_id || company.created_by;
          if (userId) {
            const { data: alert, error: alertError } = await supabase
              .from('einforma_alerts')
              .insert({
                alert_type: 'risk_change',
                company_id: company.id,
                severity: alertSeverity,
                title: `Alerta de Riesgo: ${company.name}`,
                message: alertMessage,
                user_id: userId,
                alert_data: {
                  previous_risk: previousRisk,
                  current_risk: currentRisk,
                  risk_factors: this.extractRiskFactors(creditInfo),
                  enrichment_id: enrichment.id
                }
              })
              .select()
              .single();

            if (alertError) {
              console.error('Error creating alert:', alertError);
            } else {
              alertsCreated.push(alert);
              console.log(`✅ Alert created for ${company.name}`);
            }
          }

          riskChanges.push({
            company_id: company.id,
            company_name: company.name,
            previous_risk: previousRisk,
            current_risk: currentRisk,
            risk_increased: riskIncreased
          });
        }

      } catch (error) {
        console.error(`Error processing enrichment ${enrichment.id}:`, error);
      }
    }

    // Create analytics entry
    await supabase
      .from('einforma_analytics')
      .insert({
        metric_type: 'risk_alerts',
        metric_value: alertsCreated.length,
        additional_data: {
          risk_changes: riskChanges,
          monitoring_date: new Date().toISOString(),
          companies_monitored: enrichments?.length || 0
        }
      });

    console.log(`✨ Risk monitoring completed: ${alertsCreated.length} alerts created, ${riskChanges.length} risk changes detected`);

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alertsCreated.length,
        risk_changes: riskChanges.length,
        companies_monitored: enrichments?.length || 0
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in risk monitoring:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    );
  }
});

// Helper functions
function calculateRiskScore(creditInfo: any): string {
  if (!creditInfo) return 'unknown';
  
  // Risk calculation based on financial indicators
  const revenue = creditInfo.ingresos_explotacion || 0;
  const patrimonio = creditInfo.patrimonio_neto || 0;
  const empleados = creditInfo.empleados || 0;
  
  let riskScore = 0;
  
  // Revenue risk factors
  if (revenue < 100000) riskScore += 3;
  else if (revenue < 500000) riskScore += 1;
  
  // Patrimonio risk factors
  if (patrimonio < 0) riskScore += 4;
  else if (patrimonio < 50000) riskScore += 2;
  
  // Employment risk factors
  if (empleados < 5) riskScore += 1;
  
  // Convert score to risk level
  if (riskScore >= 6) return 'critical';
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

function getRiskLevel(risk: string): number {
  const levels = { 'unknown': 0, 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
  return levels[risk] || 0;
}

function extractRiskFactors(creditInfo: any): string[] {
  const factors = [];
  if (!creditInfo) return ['Datos de crédito no disponibles'];
  
  const revenue = creditInfo.ingresos_explotacion || 0;
  const patrimonio = creditInfo.patrimonio_neto || 0;
  const empleados = creditInfo.empleados || 0;
  
  if (revenue < 100000) factors.push('Ingresos bajos');
  if (patrimonio < 0) factors.push('Patrimonio neto negativo');
  if (patrimonio < 50000) factors.push('Patrimonio neto bajo');
  if (empleados < 5) factors.push('Plantilla reducida');
  
  return factors.length > 0 ? factors : ['Sin factores de riesgo identificados'];
}