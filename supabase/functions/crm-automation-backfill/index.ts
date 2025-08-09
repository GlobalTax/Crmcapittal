import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactWithoutCompany {
  id: string;
  email: string;
  name: string;
}

interface CompanyMatch {
  id: string;
  domain: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Iniciando backfill nocturno...');

    // 1. Asociar contactos sin empresa por dominio email
    console.log('📧 Procesando contactos sin empresa...');
    await associateContactsByEmailDomain(supabase);

    // 2. Normalizar teléfonos/emails, dedupe empresas
    console.log('🔧 Normalizando datos...');
    await normalizeContactData(supabase);
    await deduplicateCompanies(supabase);

    // 3. Completar tags con IA
    console.log('🤖 Completando tags con IA...');
    await completeTagsWithAI(supabase);

    // 4. Enviar solicitudes de consentimiento pendientes
    console.log('📬 Enviando solicitudes de consentimiento...');
    await sendPendingConsentRequests(supabase);

    console.log('✅ Backfill nocturno completado');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Backfill nocturno completado exitosamente',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error en backfill nocturno:', error);
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

async function associateContactsByEmailDomain(supabase: any) {
  // Obtener contactos sin empresa
  const { data: contactsWithoutCompany, error: contactsError } = await supabase
    .from('contacts')
    .select('id, email, name, company_id')
    .is('company_id', null)
    .not('email', 'is', null);

  if (contactsError) {
    console.error('Error obteniendo contactos:', contactsError);
    return;
  }

  console.log(`📊 Encontrados ${contactsWithoutCompany?.length || 0} contactos sin empresa`);

  for (const contact of contactsWithoutCompany || []) {
    if (!contact.email) continue;

    const domain = contact.email.split('@')[1];
    if (!domain) continue;

    // Buscar empresa por dominio
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name, domain')
      .eq('domain', domain)
      .limit(1);

    if (companyError || !companies?.length) continue;

    const company = companies[0];

    // Asociar contacto con empresa
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ company_id: company.id })
      .eq('id', contact.id);

    if (!updateError) {
      console.log(`✅ Contacto ${contact.name} asociado con empresa ${company.name}`);
    }
  }
}

async function normalizeContactData(supabase: any) {
  // Normalizar teléfonos y emails
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id, phone, email');

  if (error) {
    console.error('Error obteniendo contactos para normalizar:', error);
    return;
  }

  for (const contact of contacts || []) {
    const updates: any = {};

    // Normalizar teléfono
    if (contact.phone) {
      const normalizedPhone = normalizePhone(contact.phone);
      if (normalizedPhone !== contact.phone) {
        updates.phone = normalizedPhone;
      }
    }

    // Normalizar email
    if (contact.email) {
      const normalizedEmail = contact.email.toLowerCase().trim();
      if (normalizedEmail !== contact.email) {
        updates.email = normalizedEmail;
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contact.id);
    }
  }
}

async function deduplicateCompanies(supabase: any) {
  // Buscar empresas duplicadas por dominio o NIF
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, domain, nif')
    .order('created_at', { ascending: true });

  if (error) return;

  const seenDomains = new Map();
  const seenNifs = new Map();
  const duplicateIds = [];

  for (const company of companies || []) {
    let isDuplicate = false;

    if (company.domain && seenDomains.has(company.domain)) {
      isDuplicate = true;
      // Mover contactos a la empresa original
      await moveContactsToOriginalCompany(supabase, company.id, seenDomains.get(company.domain));
    } else if (company.domain) {
      seenDomains.set(company.domain, company.id);
    }

    if (company.nif && seenNifs.has(company.nif)) {
      isDuplicate = true;
      if (!seenDomains.has(company.domain)) {
        await moveContactsToOriginalCompany(supabase, company.id, seenNifs.get(company.nif));
      }
    } else if (company.nif) {
      seenNifs.set(company.nif, company.id);
    }

    if (isDuplicate) {
      duplicateIds.push(company.id);
    }
  }

  // Eliminar empresas duplicadas
  if (duplicateIds.length > 0) {
    await supabase
      .from('companies')
      .delete()
      .in('id', duplicateIds);
    
    console.log(`🗑️ Eliminadas ${duplicateIds.length} empresas duplicadas`);
  }
}

async function moveContactsToOriginalCompany(supabase: any, duplicateId: string, originalId: string) {
  await supabase
    .from('contacts')
    .update({ company_id: originalId })
    .eq('company_id', duplicateId);
}

async function completeTagsWithAI(supabase: any) {
  // Obtener empresas con datos incompletos
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, description, industry, business_segment')
    .or('industry.is.null,business_segment.is.null')
    .limit(10); // Procesar por lotes

  if (error || !companies?.length) return;

  for (const company of companies) {
    try {
      // Llamar a OpenAI para completar tags
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('openai-assistant', {
        body: {
          type: 'company_enrichment',
          data: {
            company_name: company.name,
            description: company.description || '',
            current_industry: company.industry,
            current_segment: company.business_segment
          }
        }
      });

      if (aiError || !aiResult?.success) continue;

      const updates: any = {};
      if (!company.industry && aiResult.data.industry) {
        updates.industry = aiResult.data.industry;
      }
      if (!company.business_segment && aiResult.data.business_segment) {
        updates.business_segment = aiResult.data.business_segment;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('companies')
          .update(updates)
          .eq('id', company.id);

        console.log(`🏷️ Tags completados para empresa ${company.name}`);
      }
    } catch (error) {
      console.error(`Error completando tags para ${company.name}:`, error);
    }
  }
}

async function sendPendingConsentRequests(supabase: any) {
  // Obtener contactos que requieren consentimiento
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id, name, email, consent_status')
    .is('consent_status', null)
    .not('email', 'is', null)
    .limit(20); // Limitar para evitar spam

  if (error || !contacts?.length) return;

  for (const contact of contacts) {
    try {
      // Enviar email de solicitud de consentimiento
      const { error: emailError } = await supabase.functions.invoke('send-consent-request', {
        body: {
          to: contact.email,
          name: contact.name,
          contact_id: contact.id
        }
      });

      if (!emailError) {
        // Marcar como enviado
        await supabase
          .from('contacts')
          .update({ consent_status: 'requested' })
          .eq('id', contact.id);

        console.log(`📧 Solicitud de consentimiento enviada a ${contact.email}`);
      }
    } catch (error) {
      console.error(`Error enviando consentimiento a ${contact.email}:`, error);
    }
  }
}

function normalizePhone(phone: string): string {
  // Remover caracteres no numéricos excepto +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Si empieza con 34 y no tiene +, añadir +
  if (normalized.startsWith('34') && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  // Si no tiene código de país, asumir España
  if (!normalized.startsWith('+') && normalized.length === 9) {
    normalized = '+34' + normalized;
  }
  
  return normalized;
}

serve(handler);