import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReMatchingRequest {
  company_id?: string;
  trigger_field?: string;
  recalculate_all_matches?: boolean;
  mandate_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_id, trigger_field, recalculate_all_matches, mandate_id }: ReMatchingRequest = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Iniciando proceso de re-matching...');

    let processedCompanies = 0;
    let newMatches = 0;
    let updatedMatches = 0;

    if (company_id) {
      // Re-matching específico para una empresa
      console.log(`🎯 Re-matching específico para empresa ${company_id}`);
      const result = await processCompanyMatching(supabase, company_id);
      processedCompanies = 1;
      newMatches = result.newMatches;
      updatedMatches = result.updatedMatches;
    } else if (mandate_id) {
      // Re-matching para un mandato específico
      console.log(`📋 Re-matching para mandato ${mandate_id}`);
      const result = await processMandateMatching(supabase, mandate_id);
      processedCompanies = result.processedCompanies;
      newMatches = result.newMatches;
    } else if (recalculate_all_matches) {
      // Re-matching completo del sistema
      console.log('🌐 Re-matching completo del sistema');
      const result = await processFullReMatching(supabase);
      processedCompanies = result.processedCompanies;
      newMatches = result.newMatches;
      updatedMatches = result.updatedMatches;
    }

    // Log de la operación
    await supabase
      .from('automation_logs')
      .insert({
        automation_type: 'rematching',
        trigger_event: trigger_field || 'manual_trigger',
        entity_type: company_id ? 'company' : 'system',
        entity_id: company_id || null,
        action_taken: 'rematching_completed',
        action_data: {
          processed_companies: processedCompanies,
          new_matches: newMatches,
          updated_matches: updatedMatches,
          trigger_field
        },
        status: 'success'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Re-matching completado exitosamente',
        results: {
          processed_companies: processedCompanies,
          new_matches: newMatches,
          updated_matches: updatedMatches
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error en re-matching:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function processCompanyMatching(supabase: any, companyId: string) {
  let newMatches = 0;
  let updatedMatches = 0;

  // Obtener datos de la empresa
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (companyError || !company) {
    throw new Error(`Empresa no encontrada: ${companyId}`);
  }

  // Obtener mandatos activos para matching
  const { data: mandates, error: mandatesError } = await supabase
    .from('buying_mandates')
    .select('*')
    .eq('status', 'active');

  if (mandatesError) {
    console.error('Error obteniendo mandatos:', mandatesError);
    return { newMatches, updatedMatches };
  }

  // Evaluar matches contra cada mandato
  for (const mandate of mandates || []) {
    const matchScore = calculateMatchScore(company, mandate);
    
    if (matchScore >= 50) { // Umbral mínimo de match
      // Verificar si ya existe un match
      const { data: existingMatch, error: matchError } = await supabase
        .from('mandate_matches')
        .select('id, match_score')
        .eq('company_id', companyId)
        .eq('mandate_id', mandate.id)
        .maybeSingle();

      if (matchError) continue;

      if (existingMatch) {
        // Actualizar match existente si el score cambió significativamente
        if (Math.abs(existingMatch.match_score - matchScore) >= 5) {
          await supabase
            .from('mandate_matches')
            .update({
              match_score: matchScore,
              updated_at: new Date().toISOString(),
              match_details: generateMatchDetails(company, mandate)
            })
            .eq('id', existingMatch.id);
          
          updatedMatches++;
        }
      } else {
        // Crear nuevo match
        await supabase
          .from('mandate_matches')
          .insert({
            company_id: companyId,
            mandate_id: mandate.id,
            match_score: matchScore,
            match_details: generateMatchDetails(company, mandate),
            status: 'new'
          });
        
        newMatches++;
      }
    }
  }

  return { newMatches, updatedMatches };
}

async function processMandateMatching(supabase: any, mandateId: string) {
  let processedCompanies = 0;
  let newMatches = 0;

  // Obtener mandato
  const { data: mandate, error: mandateError } = await supabase
    .from('buying_mandates')
    .select('*')
    .eq('id', mandateId)
    .single();

  if (mandateError || !mandate) {
    throw new Error(`Mandato no encontrado: ${mandateId}`);
  }

  // Obtener empresas candidatas basadas en criterios del mandato
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('company_status', 'activa')
    .gte('annual_revenue', mandate.min_revenue || 0)
    .lte('annual_revenue', mandate.max_revenue || Number.MAX_SAFE_INTEGER);

  if (companiesError) {
    console.error('Error obteniendo empresas:', companiesError);
    return { processedCompanies, newMatches };
  }

  for (const company of companies || []) {
    processedCompanies++;
    
    const matchScore = calculateMatchScore(company, mandate);
    
    if (matchScore >= 50) {
      // Verificar si ya existe match
      const { data: existingMatch } = await supabase
        .from('mandate_matches')
        .select('id')
        .eq('company_id', company.id)
        .eq('mandate_id', mandateId)
        .maybeSingle();

      if (!existingMatch) {
        await supabase
          .from('mandate_matches')
          .insert({
            company_id: company.id,
            mandate_id: mandateId,
            match_score: matchScore,
            match_details: generateMatchDetails(company, mandate),
            status: 'new'
          });
        
        newMatches++;
      }
    }
  }

  return { processedCompanies, newMatches };
}

async function processFullReMatching(supabase: any) {
  let processedCompanies = 0;
  let newMatches = 0;
  let updatedMatches = 0;

  // Limpiar matches obsoletos
  await supabase
    .from('mandate_matches')
    .delete()
    .lt('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Más de 30 días

  // Obtener todas las empresas activas
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('company_status', 'activa')
    .limit(100); // Procesar por lotes

  if (companiesError) {
    console.error('Error obteniendo empresas:', companiesError);
    return { processedCompanies, newMatches, updatedMatches };
  }

  for (const company of companies || []) {
    const result = await processCompanyMatching(supabase, company.id);
    processedCompanies++;
    newMatches += result.newMatches;
    updatedMatches += result.updatedMatches;
  }

  return { processedCompanies, newMatches, updatedMatches };
}

function calculateMatchScore(company: any, mandate: any): number {
  let score = 0;
  let maxScore = 0;

  // Score por industria (30 puntos)
  maxScore += 30;
  if (mandate.target_sectors?.includes(company.industry)) {
    score += 30;
  } else if (company.industry && mandate.target_sectors?.length > 0) {
    // Puntuación parcial por industrias relacionadas
    score += 10;
  }

  // Score por geografía (20 puntos)
  maxScore += 20;
  if (mandate.target_locations?.includes(company.country) || 
      mandate.target_locations?.includes(company.region)) {
    score += 20;
  } else if (company.geographic_scope === 'internacional') {
    score += 15;
  }

  // Score por tamaño/revenue (25 puntos)
  maxScore += 25;
  if (company.annual_revenue >= (mandate.min_revenue || 0) && 
      company.annual_revenue <= (mandate.max_revenue || Number.MAX_SAFE_INTEGER)) {
    score += 25;
  } else {
    // Puntuación parcial si está cerca del rango
    const minRev = mandate.min_revenue || 0;
    const maxRev = mandate.max_revenue || Number.MAX_SAFE_INTEGER;
    const companyRev = company.annual_revenue || 0;
    
    if (companyRev > 0) {
      if (companyRev < minRev && companyRev >= minRev * 0.7) score += 15;
      if (companyRev > maxRev && companyRev <= maxRev * 1.3) score += 15;
    }
  }

  // Score por readiness (15 puntos)
  maxScore += 15;
  if (mandate.mandate_type === 'compra' && company.seller_ready) {
    score += 15;
  } else if (mandate.mandate_type === 'venta' && company.buyer_active) {
    score += 15;
  }

  // Score por engagement (10 puntos)
  maxScore += 10;
  if (company.engagement_score >= 70) {
    score += 10;
  } else if (company.engagement_score >= 50) {
    score += 5;
  }

  // Normalizar a 0-100
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

function generateMatchDetails(company: any, mandate: any): any {
  return {
    industry_match: mandate.target_sectors?.includes(company.industry),
    geography_match: mandate.target_locations?.includes(company.country),
    revenue_in_range: company.annual_revenue >= (mandate.min_revenue || 0) && 
                     company.annual_revenue <= (mandate.max_revenue || Number.MAX_SAFE_INTEGER),
    readiness_score: mandate.mandate_type === 'compra' ? company.seller_ready : company.buyer_active,
    engagement_level: company.engagement_score || 0,
    calculated_at: new Date().toISOString()
  };
}

serve(handler);