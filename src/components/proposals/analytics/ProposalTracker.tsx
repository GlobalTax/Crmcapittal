import React, { useEffect } from 'react';
import { useProposalAnalytics } from '@/hooks/useProposalAnalytics';

interface ProposalTrackerProps {
  proposalId: string;
  children: React.ReactNode;
  trackOnMount?: boolean;
}

export const ProposalTracker: React.FC<ProposalTrackerProps> = ({
  proposalId,
  children,
  trackOnMount = true
}) => {
  const { trackEvent } = useProposalAnalytics();
  
  useEffect(() => {
    if (trackOnMount && proposalId) {
      // Track initial view
      trackEvent(proposalId, 'view', {
        source: 'proposal_view',
        timestamp: new Date().toISOString()
      });

      // Track time spent on page
      const startTime = Date.now();
      
      const handleBeforeUnload = () => {
        const duration = Math.round((Date.now() - startTime) / 1000);
        if (duration > 5) { // Only track if user spent more than 5 seconds
          trackEvent(proposalId, 'view', {
            source: 'proposal_view_duration',
            duration_seconds: duration
          }, duration);
        }
      };

      // Track scroll depth
      let maxScrollDepth = 0;
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollDepth = Math.round((scrollTop / documentHeight) * 100);
        
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          
          // Track significant scroll milestones
          if (scrollDepth >= 25 && scrollDepth < 50 && maxScrollDepth < 25) {
            trackEvent(proposalId, 'section_view', { scroll_depth: 25 });
          } else if (scrollDepth >= 50 && scrollDepth < 75 && maxScrollDepth < 50) {
            trackEvent(proposalId, 'section_view', { scroll_depth: 50 });
          } else if (scrollDepth >= 75 && maxScrollDepth < 75) {
            trackEvent(proposalId, 'section_view', { scroll_depth: 75 });
          } else if (scrollDepth >= 90 && maxScrollDepth < 90) {
            trackEvent(proposalId, 'section_view', { scroll_depth: 100 });
          }
        }
      };

      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Cleanup
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('scroll', handleScroll);
        
        // Track final duration on component unmount
        const duration = Math.round((Date.now() - startTime) / 1000);
        if (duration > 5) {
          trackEvent(proposalId, 'view', {
            source: 'proposal_view_unmount',
            duration_seconds: duration,
            scroll_depth: maxScrollDepth
          }, duration);
        }
      };
    }
  }, [proposalId, trackOnMount, trackEvent]);

  return <>{children}</>;
};