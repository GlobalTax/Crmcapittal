import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyStats } from '@/hooks/useCompanyStats';

interface HealthBreakdown {
  engagement: number;
  coverage: number;
  pipeline: number;
}

export interface AccountIntelligenceData {
  healthScore: number;
  healthLevel: 'bajo' | 'medio' | 'alto';
  metrics: {
    contactsCount: number;
    decisionMakers: number;
    activeDealsCount: number;
    totalPipelineValue: number;
    recentActivities: number;
  };
  breakdown: HealthBreakdown;
  buyingSignals: string[];
  suggestions: string[];
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const isDecisionMaker = (title?: string | null) => {
  if (!title) return false;
  const t = title.toLowerCase();
  return /(ceo|cfo|coo|cto|cio|owner|founder|vp|vice\s*president|director|head|gerente\s*general)/.test(t);
};

export const useAccountIntelligence = (companyId: string, companyName?: string) => {
  const stats = useCompanyStats(companyId, companyName);
  const [data, setData] = useState<AccountIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!companyId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('id, name, position')
          .eq('company_id', companyId);
        if (contactsError) throw contactsError;

        const contactIds = (contacts || []).map((c: any) => c.id);
        const decisionMakers = (contacts || []).filter((c: any) => isDecisionMaker(c.position)).length;

        // Recent contact activities (last 30 days)
        let recentActivities = 0;
        if (contactIds.length > 0) {
          const since = new Date();
          since.setDate(since.getDate() - 30);
          const { data: acts, error: actsError } = await supabase
            .from('contact_activities')
            .select('id, created_at')
            .in('contact_id', contactIds)
            .gte('created_at', since.toISOString());
          if (actsError) {
            // If table or RLS blocks, continue without activities
            console.warn('No se pudo obtener actividades recientes', actsError);
          } else {
            recentActivities = acts?.length || 0;
          }
        }

        // Health breakdown
        const engagement = clamp(Math.min(100, (recentActivities / 30) * 100));
        const coverage = clamp(
          contacts && contacts.length > 0 ? (decisionMakers / contacts.length) * 100 : 0
        );
        // Normalize pipeline with log scale
        const pipeline = clamp(Math.log10(1 + (stats.totalPipelineValue || 0)) * 15);

        const healthScore = Math.round(0.4 * engagement + 0.3 * coverage + 0.3 * pipeline);
        const healthLevel: 'bajo' | 'medio' | 'alto' = healthScore >= 70 ? 'alto' : healthScore >= 40 ? 'medio' : 'bajo';

        const buyingSignals: string[] = [];
        if (recentActivities >= 5) buyingSignals.push('Alta actividad en los últimos 30 días');
        if ((stats.activeDealsCount || 0) > 0) buyingSignals.push('Deals activos en curso');
        if (coverage >= 50) buyingSignals.push('Cobertura adecuada de decisores');

        // Suggestions
        const suggestions: string[] = [];
        const minSub = Math.min(engagement, coverage, pipeline);
        if (minSub === engagement) suggestions.push('Incrementar interacciones: agenda reunión ejecutiva');
        if (minSub === coverage) suggestions.push('Ampliar cobertura: identificar y contactar decisores');
        if (minSub === pipeline) suggestions.push('Aumentar pipeline: proponer siguiente fase/mandato');

        setData({
          healthScore,
          healthLevel,
          metrics: {
            contactsCount: contacts?.length || 0,
            decisionMakers,
            activeDealsCount: stats.activeDealsCount || 0,
            totalPipelineValue: stats.totalPipelineValue || 0,
            recentActivities,
          },
          breakdown: { engagement, coverage, pipeline },
          buyingSignals,
          suggestions,
        });
      } catch (e: any) {
        console.error('useAccountIntelligence error', e);
        setError('No se pudo cargar la inteligencia de la cuenta');
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [companyId, companyName, stats.activeDealsCount, stats.totalPipelineValue]);

  return useMemo(
    () => ({ data, isLoading: isLoading || stats.isLoading, error: error || stats.error }),
    [data, isLoading, stats.isLoading, error, stats.error]
  );
};
