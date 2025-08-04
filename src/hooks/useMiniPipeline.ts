import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Deal {
  id: string;
  deal_name: string;
  company_name?: string;
  deal_value?: number;
  stage?: string;
}

interface PipelineStage {
  name: string;
  deals: Deal[];
}

export const useMiniPipeline = () => {
  const { user } = useAuth();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPipelineData = async () => {
      try {
        setLoading(true);
        
        // Fetch deals from the deals table
        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .select('id, deal_name, company_name, deal_value')
          .eq('created_by', user.id)
          .eq('is_active', true)
          .limit(20);

        if (dealsError) {
          console.error('Error fetching deals:', dealsError);
        }

        // Simple array transformation without complex typing issues
        const allDeals: Deal[] = dealsData ? dealsData.map(deal => ({
          id: deal.id,
          deal_name: deal.deal_name,
          company_name: deal.company_name,
          deal_value: deal.deal_value,
          stage: 'Lead' // Default stage for deals table
        })) : [];

        // Group deals by stage (for mini pipeline, we only show first 3 stages)
        const stageNames = ['Lead', 'Qualifying', 'Proposal'];
        const groupedStages: PipelineStage[] = stageNames.map(stageName => ({
          name: stageName,
          deals: allDeals.filter(deal => {
            // For deals without explicit stage, assume they're leads
            if (!deal.stage) return stageName === 'Lead';
            return deal.stage === stageName;
          })
        }));

        setStages(groupedStages);
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
        setError(err instanceof Error ? err.message : 'Error fetching pipeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineData();

    // Refresh every 10 minutes
    const interval = setInterval(fetchPipelineData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return { stages, loading, error };
};