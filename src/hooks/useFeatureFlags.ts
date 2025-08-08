import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type FeatureFlag = {
  key: string;
  enabled: boolean;
  organization_id?: string;
  environment?: string;
  rollout_percentage?: number;
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

        // Get user's organization (simplified for now)
        const orgId = null; // No organization support yet
        const environment = import.meta.env.MODE || 'development';

        // Check feature flags
        const { data: featureFlags } = await supabase
          .from('feature_flags')
          .select('*')
          .or(`organization_id.is.null,organization_id.eq.${orgId}`)
          .or(`environment.is.null,environment.eq.${environment}`);

        const flagsMap: Record<string, boolean> = {};
        
        featureFlags?.forEach(flag => {
          // Check rollout percentage
          if (flag.rollout_percentage && flag.rollout_percentage < 100) {
            const userHash = hashString(user.id);
            const userPercentile = userHash % 100;
            flagsMap[flag.key] = flag.enabled && userPercentile < flag.rollout_percentage;
          } else {
            flagsMap[flag.key] = flag.enabled;
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