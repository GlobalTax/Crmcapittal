import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProposalAnalytics {
  id: string;
  proposal_id: string;
  event_type: 'view' | 'download' | 'share' | 'email_open' | 'email_click' | 'section_view';
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  duration_seconds?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ProposalStats {
  id: string;
  proposal_id: string;
  total_views: number;
  unique_views: number;
  total_duration_seconds: number;
  avg_duration_seconds: number;
  bounce_rate: number;
  conversion_rate: number;
  email_opens: number;
  email_clicks: number;
  downloads: number;
  shares: number;
  engagement_score: number;
  last_viewed_at?: string;
}

export interface EmailTracking {
  id: string;
  proposal_id: string;
  recipient_email: string;
  email_subject?: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
}

export function useProposalAnalytics(proposalId?: string) {
  const [analytics, setAnalytics] = useState<ProposalAnalytics[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [emailTracking, setEmailTracking] = useState<EmailTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (id?: string) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('proposal_analytics')
        .select('*')
        .eq('proposal_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnalytics((data || []) as ProposalAnalytics[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch proposal stats
  const fetchStats = async (id?: string) => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('proposal_stats')
        .select('*')
        .eq('proposal_id', id)
        .maybeSingle();
      
      if (error) throw error;
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching stats');
    }
  };

  // Fetch email tracking
  const fetchEmailTracking = async (id?: string) => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('proposal_email_tracking')
        .select('*')
        .eq('proposal_id', id)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      setEmailTracking((data || []) as EmailTracking[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching email tracking');
    }
  };

  // Track analytics event
  const trackEvent = async (
    proposal_id: string,
    event_type: ProposalAnalytics['event_type'],
    metadata: Record<string, any> = {},
    duration_seconds?: number
  ) => {
    try {
      const sessionId = sessionStorage.getItem('proposal_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      sessionStorage.setItem('proposal_session_id', sessionId);

      const { error } = await supabase
        .from('proposal_analytics')
        .insert({
          proposal_id,
          event_type,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          duration_seconds,
          metadata
        });

      if (error) throw error;
      
      // Refresh data if this is the current proposal
      if (proposal_id === proposalId) {
        fetchAnalytics(proposalId);
        fetchStats(proposalId);
      }
    } catch (err) {
      console.error('Error tracking event:', err);
    }
  };

  // Track email event
  const trackEmailEvent = async (
    proposal_id: string,
    recipient_email: string,
    event_type: 'sent' | 'opened' | 'clicked',
    email_subject?: string
  ) => {
    try {
      if (event_type === 'sent') {
        // Create new email tracking record
        const { error } = await supabase
          .from('proposal_email_tracking')
          .insert({
            proposal_id,
            recipient_email,
            email_subject,
            status: 'sent'
          });
        
        if (error) throw error;
      } else {
        // Update existing record
        const updateData: any = {
          status: event_type,
          [`${event_type === 'opened' ? 'open' : 'click'}_count`]: 1
        };
        
        if (event_type === 'opened') {
          updateData.opened_at = new Date().toISOString();
        } else {
          updateData.clicked_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from('proposal_email_tracking')
          .update(updateData)
          .eq('proposal_id', proposal_id)
          .eq('recipient_email', recipient_email);
        
        if (error) throw error;
      }
      
      // Refresh email tracking data
      if (proposal_id === proposalId) {
        fetchEmailTracking(proposalId);
      }
    } catch (err) {
      console.error('Error tracking email event:', err);
    }
  };

  // Get aggregated analytics
  const getAggregatedStats = () => {
    if (!analytics.length) return null;

    const totalViews = analytics.filter(a => a.event_type === 'view').length;
    const uniqueSessions = new Set(analytics.map(a => a.session_id)).size;
    const totalDuration = analytics
      .filter(a => a.duration_seconds)
      .reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
    
    const avgDuration = totalViews > 0 ? totalDuration / totalViews : 0;
    
    return {
      totalViews,
      uniqueViews: uniqueSessions,
      totalDuration,
      avgDuration,
      downloads: analytics.filter(a => a.event_type === 'download').length,
      shares: analytics.filter(a => a.event_type === 'share').length,
      emailOpens: analytics.filter(a => a.event_type === 'email_open').length,
      emailClicks: analytics.filter(a => a.event_type === 'email_click').length
    };
  };

  useEffect(() => {
    if (proposalId) {
      fetchAnalytics(proposalId);
      fetchStats(proposalId);
      fetchEmailTracking(proposalId);
    }
  }, [proposalId]);

  return {
    analytics,
    stats,
    emailTracking,
    loading,
    error,
    trackEvent,
    trackEmailEvent,
    aggregatedStats: getAggregatedStats(),
    refetch: () => {
      if (proposalId) {
        fetchAnalytics(proposalId);
        fetchStats(proposalId);
        fetchEmailTracking(proposalId);
      }
    }
  };
}