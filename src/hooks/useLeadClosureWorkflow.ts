import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/types/Lead';
import type { CreateBuyingMandateData } from '@/types/BuyingMandate';

export type LeadClosureType = 'sell' | 'buy' | 'valuation';

// Tipos de payload normalizados
export type LeadClosurePayload =
  | ({ entity: 'buying_mandate' } & CreateBuyingMandateData)
  | ({ entity: 'valuation' } & {
      company_name: string;
      client_name: string;
      client_email?: string;
      priority?: string;
      valuation_type?: string;
      notes?: string;
      status?: string;
    });

// Utilidades
const normalizeText = (v?: string) => (v || '').toLowerCase();
const includesAny = (txt: string, keys: string[]) => keys.some(k => txt.includes(k));

export const useLeadClosureWorkflow = () => {
  // 1) Recomendación heurística
  const suggest = useCallback((lead: Lead): LeadClosureType => {
    const notes = normalizeText((lead as any).notes || lead.message || '');
    const lost = normalizeText(lead.lost_reason);
    const text = `${notes} ${lost}`.trim();

    // Palabras clave explícitas
    if (includesAny(text, ['valoración', 'valoracion', 'tasación', 'tasacion', 'valuation'])) return 'valuation';
    if (includesAny(text, ['vender', 'venta', 'sell-side', 'mandato venta'])) return 'sell';
    if (includesAny(text, ['comprar', 'compra', 'buy-side', 'adquirir'])) return 'buy';

    // Empates o sin señales: valoración > sell > buy (fallback por sector/tamaño)
    return 'valuation';
  }, []);

  // 2) Construcción de payload
  const buildPayload = useCallback((lead: Lead, type: LeadClosureType): LeadClosurePayload => {
    // Comunes
    const companyName = (lead.company as string) || lead.company_name || '';
    const contactName = lead.name || lead.lead_name || '';
    const email = lead.email;
    const sector = (lead.sector as any)?.nombre || lead.industry;
    const notes = (lead as any).notes || lead.message;
    const assigned_to = lead.assigned_to_id || lead.owner_id;

    if (type === 'valuation') {
      // Heurística de prioridad por urgencia
      const lowText = `${normalizeText(notes)} ${normalizeText(lead.message)}`;
      const urgent = includesAny(lowText, ['urgente', 'ya', 'lo antes posible', 'prioridad', 'deadline']);

      return {
        entity: 'valuation',
        company_name: companyName,
        client_name: contactName,
        client_email: email,
        valuation_type: 'empresa_completa',
        priority: urgent ? 'high' : 'medium',
        notes: [
          sector ? `Sector: ${sector}` : undefined,
          assigned_to ? `Asignado a: ${assigned_to}` : undefined,
        ]
          .filter(Boolean)
          .join(' \n'),
        status: 'requested',
      };
    }

    // Mandatos (sell/buy)
    const isSell = type === 'sell';
    const mandate_type_db = isSell ? 'venta' : 'compra';

    // Ticket basado en deal_value ±20%
    const dealValue = lead.deal_value || lead.valor_estimado;
    const min_revenue = dealValue ? Math.round(dealValue * 0.8) : undefined;
    const max_revenue = dealValue ? Math.round(dealValue * 1.2) : undefined;

    const payloadMandate: CreateBuyingMandateData = {
      client_name: contactName || 'Contacto',
      client_contact: contactName || 'Contacto',
      client_email: email || undefined,
      client_phone: lead.phone || undefined,
      mandate_name: `${isSell ? 'Mandato de Venta' : 'Mandato de Compra'} — ${companyName || contactName || 'Sin nombre'}`,
      target_sectors: sector ? [sector] : [],
      target_locations: [], // Si en el futuro hay city/country, mapear aquí
      min_revenue,
      max_revenue,
      mandate_type: mandate_type_db as any,
      assigned_user_id: assigned_to,
      start_date: new Date().toISOString(),
      other_criteria: notes,
    };

    return { entity: 'buying_mandate', ...payloadMandate };
  }, []);

  // 3) Creación unificada
  const createFromLead = useCallback(
    async (
      leadId: string,
      type: LeadClosureType,
      payload: LeadClosurePayload,
      linkToLead: boolean
    ): Promise<{ id: string }> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No autenticado');

        if (type === 'valuation' && payload.entity === 'valuation') {
          // Insert directo en tabla valoraciones
          const insertBody: any = {
            company_name: payload.company_name,
            client_name: payload.client_name,
            client_email: payload.client_email,
            priority: payload.priority,
            status: payload.status || 'requested',
            company_description: payload.notes,
            // No conocemos si existe lead_id en esquema; evitar columnas desconocidas
          };

          const { data, error } = await supabase
            .from('valoraciones')
            .insert([insertBody])
            .select()
            .single();

          if (error) throw error;
          return { id: data.id as string };
        }

        if (payload.entity === 'buying_mandate') {
          const insertBody = {
            ...payload,
            mandate_type: (payload.mandate_type || (type === 'sell' ? 'venta' : 'compra')),
            created_by: user.id,
          } as CreateBuyingMandateData & { created_by: string };

          // La tabla buying_mandates espera start_date tipo date; si viene ISO, Postgres lo castea
          const { data, error } = await supabase
            .from('buying_mandates')
            .insert([insertBody as any])
            .select()
            .single();

          if (error) throw error;
          return { id: data.id as string };
        }

        throw new Error('Tipo de payload no soportado');
      } catch (e: any) {
        // Mensajes legibles
        const msg = e?.message || 'Error al crear elemento desde lead';
        if (msg.includes('RLS') || msg.includes('row level')) {
          throw new Error('No tienes permisos para crear este elemento');
        }
        if (msg.includes('foreign key')) {
          throw new Error('Datos relacionados inválidos (empresa/contacto)');
        }
        if (msg.includes('null value') || msg.includes('violates not-null')) {
          throw new Error('Faltan campos obligatorios');
        }
        throw new Error(msg);
      }
    },
  []);

  return { suggest, buildPayload, createFromLead };
};
