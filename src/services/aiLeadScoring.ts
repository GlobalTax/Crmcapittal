import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/Lead';

export interface ScoredLead extends Lead {
  aiScore: number;
  temperature: 'hot' | 'warm' | 'cold';
  scoreReasons: string[];
  lastScored: string; // ISO string
}

// Simple in-memory cache to limit repeated scoring during a session
const aiCache = new Map<string, { score: number; temp: 'hot' | 'warm' | 'cold'; reasons: string[]; at: string }>();

function temperatureFrom(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

export async function scoreLeads(leads: Lead[]): Promise<ScoredLead[]> {
  if (!leads || leads.length === 0) return [];

  // Build request payload, reuse cache when possible
  const toScore: Lead[] = [];
  const fromCache: Record<string, Omit<ScoredLead, keyof Lead>> = {};

  for (const lead of leads) {
    const cacheKey = `${lead.id}:${lead.updated_at}`;
    const cached = aiCache.get(cacheKey);
    if (cached) {
      fromCache[lead.id] = {
        aiScore: cached.score,
        temperature: cached.temp,
        scoreReasons: cached.reasons,
        lastScored: cached.at,
      };
    } else {
      toScore.push(lead);
    }
  }

  let scored: ScoredLead[] = [];

  // Invoke Edge Function for non-cached items
  if (toScore.length > 0) {
    const payload = {
      leads: toScore.map((l) => ({
        id: l.id,
        industry: (l as any).industry || (l as any).sector || '',
        company_size: (l as any).company_size || '',
        budget: (l as any).valor_estimado ?? (l as any).budget ?? null,
        timeline: (l as any).timeline || (l as any).close_date || '',
        engagement: (l as any).lead_score ?? (l as any).engagement_score ?? 0,
        description: (l as any).message || (l as any).notes || '',
      })),
    };

    const { data, error } = await supabase.functions.invoke('ai-lead-scoring', {
      body: payload,
    });

    if (error) {
      console.error('AI scoring error:', error);
    }

    const results: Array<{ id: string; aiScore: number; temperature: 'hot' | 'warm' | 'cold'; scoreReasons: string[]; lastScored: string }>
      = data?.results || [];

    // Merge results and update cache
    for (const lead of toScore) {
      const r = results.find((x) => x.id === lead.id);
      const aiScore = Math.max(0, Math.min(100, r?.aiScore ?? 0));
      const temp = r?.temperature ?? temperatureFrom(aiScore);
      const reasons = r?.scoreReasons ?? [];
      const at = r?.lastScored ?? new Date().toISOString();

      const cacheKey = `${lead.id}:${lead.updated_at}`;
      aiCache.set(cacheKey, { score: aiScore, temp, reasons, at });

      scored.push({ ...lead, aiScore, temperature: temp, scoreReasons: reasons, lastScored: at });
    }
  }

  // Add cached ones
  for (const lead of leads) {
    if (toScore.find((l) => l.id === lead.id)) continue; // already added above
    const c = fromCache[lead.id];
    if (c) scored.push({ ...lead, ...c });
  }

  // Preserve original order
  const order = new Map(leads.map((l, i) => [l.id, i] as const));
  scored.sort((a, b) => (order.get(a.id)! - order.get(b.id)!));

  return scored;
}
