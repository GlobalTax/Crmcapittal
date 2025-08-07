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

    console.log('🚀 Starting eInforma auto-sync process');

    // Get automation rules for auto_sync
    const { data: rules, error: rulesError } = await supabase
      .from('einforma_automation_rules')
      .select('*')
      .eq('rule_type', 'auto_sync')
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching automation rules:', rulesError);
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} active auto-sync rules`);

    // Get companies that need enrichment
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id, name, nif, annual_revenue, industry,
        company_enrichments(id, source, enrichment_date)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      throw companiesError;
    }

    const processedCompanies = [];
    const failedCompanies = [];
    let totalCost = 0;

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('einforma_sync_log')
      .insert({
        sync_type: 'auto_company',
        sync_status: 'running',
        companies_processed: 0,
        companies_successful: 0,
        companies_failed: 0,
        started_by: null, // System initiated
        sync_data: { rules_applied: rules?.length || 0 }
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError);
      throw syncLogError;
    }

    console.log(`Processing ${companies?.length || 0} companies`);

    for (const company of companies || []) {
      try {
        // Check if company needs enrichment based on rules
        let shouldEnrich = false;
        
        for (const rule of rules || []) {
          const conditions = rule.trigger_conditions as any;
          
          // Check revenue threshold
          if (conditions.min_revenue && company.annual_revenue >= conditions.min_revenue) {
            shouldEnrich = true;
            console.log(`Company ${company.name} qualifies by revenue: ${company.annual_revenue}`);
          }
          
          // Check priority sectors
          if (conditions.priority_sectors?.includes(company.industry)) {
            shouldEnrich = true;
            console.log(`Company ${company.name} qualifies by sector: ${company.industry}`);
          }
          
          // Check if enrichment is outdated (older than 30 days)
          const latestEnrichment = company.company_enrichments?.[0];
          if (latestEnrichment) {
            const enrichmentDate = new Date(latestEnrichment.enrichment_date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            if (enrichmentDate < thirtyDaysAgo) {
              shouldEnrich = true;
              console.log(`Company ${company.name} needs update - last enriched: ${enrichmentDate}`);
            }
          } else if (company.nif) {
            shouldEnrich = true;
            console.log(`Company ${company.name} has no enrichment data`);
          }
        }

        if (shouldEnrich && company.nif) {
          console.log(`🔄 Enriching company: ${company.name} (${company.nif})`);
          
          // Call eInforma enrichment function
          const { data: enrichResult, error: enrichError } = await supabase.functions.invoke(
            'einforma-enrich-company',
            {
              body: {
                nif: company.nif,
                companyId: company.id,
                auto_sync: true
              }
            }
          );

          if (enrichError) {
            console.error(`Failed to enrich ${company.name}:`, enrichError);
            failedCompanies.push({ company_id: company.id, error: enrichError.message });
          } else {
            console.log(`✅ Successfully enriched ${company.name}`);
            processedCompanies.push(company.id);
            
            // Track cost (estimated)
            totalCost += 2.50; // Basic enrichment cost
            
            // Insert cost tracking
            await supabase
              .from('einforma_cost_tracking')
              .insert({
                consultation_type: 'basic',
                cost_amount: 2.50,
                company_id: company.id,
                user_id: null, // System initiated
                request_data: { auto_sync: true, nif: company.nif },
                is_bulk_operation: true
              });
          }
        }
      } catch (error) {
        console.error(`Error processing company ${company.name}:`, error);
        failedCompanies.push({ company_id: company.id, error: error.message });
      }
    }

    // Update sync log
    await supabase
      .from('einforma_sync_log')
      .update({
        sync_status: 'completed',
        companies_processed: (companies?.length || 0),
        companies_successful: processedCompanies.length,
        companies_failed: failedCompanies.length,
        total_cost: totalCost,
        completed_at: new Date().toISOString(),
        sync_data: {
          rules_applied: rules?.length || 0,
          processed_companies: processedCompanies,
          failed_companies: failedCompanies
        }
      })
      .eq('id', syncLog.id);

    // Create analytics entry
    await supabase
      .from('einforma_analytics')
      .insert({
        metric_type: 'sync_performance',
        metric_value: processedCompanies.length,
        additional_data: {
          total_cost: totalCost,
          success_rate: processedCompanies.length / (companies?.length || 1),
          failed_count: failedCompanies.length
        }
      });

    console.log(`✨ Auto-sync completed: ${processedCompanies.length} successful, ${failedCompanies.length} failed, €${totalCost} cost`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCompanies.length,
        failed: failedCompanies.length,
        total_cost: totalCost,
        sync_id: syncLog.id
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in auto-sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      }
    );
  }
});