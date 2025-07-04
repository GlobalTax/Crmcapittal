import { useMemo } from 'react';
import { Lead, LeadStatus } from '@/types/Lead';

export interface LeadAnalytics {
  totalLeads: number;
  conversionRate: number;
  averageLeadScore: number;
  topSources: Array<{ source: string; count: number; percentage: number }>;
  statusDistribution: Array<{ status: LeadStatus; count: number; percentage: number }>;
  monthlyTrends: Array<{ month: string; count: number; converted: number }>;
  engagementMetrics: {
    totalEmailOpens: number;
    totalEmailClicks: number;
    totalWebsiteVisits: number;
    averageEngagement: number;
  };
  qualityDistribution: Array<{ quality: string; count: number; percentage: number }>;
  priorityDistribution: Array<{ priority: string; count: number; percentage: number }>;
}

export const useLeadAnalytics = (leads: Lead[]): LeadAnalytics => {
  return useMemo(() => {
    const totalLeads = leads.length;
    
    if (totalLeads === 0) {
      return {
        totalLeads: 0,
        conversionRate: 0,
        averageLeadScore: 0,
        topSources: [],
        statusDistribution: [],
        monthlyTrends: [],
        engagementMetrics: {
          totalEmailOpens: 0,
          totalEmailClicks: 0,
          totalWebsiteVisits: 0,
          averageEngagement: 0,
        },
        qualityDistribution: [],
        priorityDistribution: [],
      };
    }

    // Conversion rate calculation
    const convertedLeads = leads.filter(lead => 
      lead.status === 'CONVERTED' || lead.status === 'QUALIFIED'
    ).length;
    const conversionRate = (convertedLeads / totalLeads) * 100;

    // Average lead score
    const totalScore = leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0);
    const averageLeadScore = totalScore / totalLeads;

    // Top sources analysis
    const sourceCount = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sourceCount)
      .map(([source, count]) => ({
        source: source.replace('_', ' ').toUpperCase(),
        count,
        percentage: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Status distribution
    const statusCount = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<LeadStatus, number>);

    const statusDistribution = Object.entries(statusCount)
      .map(([status, count]) => ({
        status: status as LeadStatus,
        count,
        percentage: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Monthly trends (last 6 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthLeads = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate.getFullYear() === date.getFullYear() && 
               leadDate.getMonth() === date.getMonth();
      });

      const convertedInMonth = monthLeads.filter(lead => 
        lead.status === 'CONVERTED' || lead.status === 'QUALIFIED'
      ).length;

      return {
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        count: monthLeads.length,
        converted: convertedInMonth,
      };
    }).reverse();

    // Engagement metrics
    const totalEmailOpens = leads.reduce((sum, lead) => sum + (lead.email_opens || 0), 0);
    const totalEmailClicks = leads.reduce((sum, lead) => sum + (lead.email_clicks || 0), 0);
    const totalWebsiteVisits = leads.reduce((sum, lead) => sum + (lead.website_visits || 0), 0);
    
    const engagementMetrics = {
      totalEmailOpens,
      totalEmailClicks,
      totalWebsiteVisits,
      averageEngagement: totalLeads > 0 ? 
        (totalEmailOpens + totalEmailClicks + totalWebsiteVisits) / totalLeads : 0,
    };

    // Quality distribution
    const qualityCount = leads.reduce((acc, lead) => {
      const quality = lead.quality || 'FAIR';
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const qualityDistribution = Object.entries(qualityCount)
      .map(([quality, count]) => ({
        quality,
        count,
        percentage: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // Priority distribution
    const priorityCount = leads.reduce((acc, lead) => {
      const priority = lead.priority || 'MEDIUM';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = Object.entries(priorityCount)
      .map(([priority, count]) => ({
        priority,
        count,
        percentage: (count / totalLeads) * 100,
      }))
      .sort((a, b) => {
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      });

    return {
      totalLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageLeadScore: Math.round(averageLeadScore * 100) / 100,
      topSources,
      statusDistribution,
      monthlyTrends: monthlyData,
      engagementMetrics,
      qualityDistribution,
      priorityDistribution,
    };
  }, [leads]);
};

// Hook for specific analytics queries
export const useLeadMetrics = (leads: Lead[]) => {
  return useMemo(() => {
    const highPriorityLeads = leads.filter(l => l.priority === 'HIGH' || l.priority === 'URGENT').length;
    const excellentQualityLeads = leads.filter(l => l.quality === 'EXCELLENT').length;
    const recentLeads = leads.filter(l => {
      const daysDiff = (Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;
    
    const assignedLeads = leads.filter(l => l.assigned_to_id).length;
    const unassignedLeads = leads.length - assignedLeads;
    
    const activeLeads = leads.filter(l => 
      !['CONVERTED', 'LOST', 'DISQUALIFIED'].includes(l.status)
    ).length;

    return {
      highPriorityLeads,
      excellentQualityLeads,
      recentLeads,
      assignedLeads,
      unassignedLeads,
      activeLeads,
      assignmentRate: leads.length > 0 ? (assignedLeads / leads.length) * 100 : 0,
    };
  }, [leads]);
};