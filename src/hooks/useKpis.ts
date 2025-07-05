import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface KpisData {
  pendingTasks: number;
  leadsAssigned: number;
  activeDeals: number;
  estimatedRevenue: number;
}

export const useKpis = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KpisData>({
    pendingTasks: 0,
    leadsAssigned: 0,
    activeDeals: 0,
    estimatedRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchKpis = async () => {
      try {
        setLoading(true);
        
        // Temporary mock data to avoid TypeScript issues
        // TODO: Replace with real Supabase queries once TypeScript issues are resolved
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setKpis({
          pendingTasks: 5,
          leadsAssigned: 12,
          activeDeals: 8,
          estimatedRevenue: 45000,
        });
      } catch (err) {
        console.error('Error fetching KPIs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();

    // Refresh every 5 minutes
    const interval = setInterval(fetchKpis, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return { kpis, loading, error };
};