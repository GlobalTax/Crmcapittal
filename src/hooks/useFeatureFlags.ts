
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type FeatureFlag = {
  key: string;
  enabled: boolean;
  organization_id?: string | null;
  environment?: string | null;
  rollout_percentage?: number | null;
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Organización no implementada aún: null
        const orgId: string | null = null;
        const environment = (import.meta as any).env?.MODE || 'development';

        // Construimos filtros OR válidos evitando eq.null
        const orgFilter = orgId
          ? `organization_id.eq.${orgId},organization_id.is.null`
          : `organization_id.is.null`;
        const envFilter = environment
          ? `environment.eq.${environment},environment.is.null`
          : `environment.is.null`;

        // Consulta de feature flags por organización/entorno con fallback a null
        const { data: featureFlags, error } = await supabase
          .from('feature_flags')
          .select('*')
          .or(orgFilter)
          .or(envFilter);

        if (error) {
          console.error('Error loading feature flags (query):', error);
        }

        const flagsMap: Record<string, boolean> = {};
        featureFlags?.forEach((flag: FeatureFlag) => {
          // Check rollout percentage
          if (flag.rollout_percentage != null && flag.rollout_percentage < 100) {
            const userHash = hashString(user.id);
            const userPercentile = userHash % 100;
            flagsMap[flag.key] = !!flag.enabled && userPercentile < flag.rollout_percentage;
          } else {
            flagsMap[flag.key] = !!flag.enabled;
          }
        });

        setFlags(flagsMap);
      } catch (error) {
        console.error('Error loading feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeatureFlags();
  }, []);

  const isEnabled = (flagKey: string): boolean => {
    return flags[flagKey] ?? false;
  };

  return { isEnabled, loading, flags };
};

// Simple hash function for user ID
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
