import { useMemo } from 'react';
import { Lead } from '@/types/Lead';
import { useLeadAnalytics } from './useLeadAnalytics';

interface CachedMetrics {
  totalLeads: number;
  conversionRate: number;
  averageScore: number;
  topSources: Array<{ source: string; count: number; percentage: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  lastCalculated: number;
}

// In-memory cache for expensive calculations
const metricsCache = new Map<string, CachedMetrics>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useLeadsCache = (leads: Lead[], cacheKey: string = 'default') => {
  const cachedMetrics = useMemo(() => {
    const now = Date.now();
    const cached = metricsCache.get(cacheKey);
    
    // Check if cache is valid
    if (cached && (now - cached.lastCalculated) < CACHE_DURATION) {
      return cached;
    }
    
    // Calculate fresh metrics
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => 
      l.status === 'CONVERTED' || l.status === 'QUALIFIED'
    ).length;
    
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const averageScore = totalLeads > 0 ? 
      leads.reduce((sum, lead) => sum + lead.lead_score, 0) / totalLeads : 0;
    
    // Source analysis
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
    }, {} as Record<string, number>);
    
    const statusDistribution = Object.entries(statusCount)
      .map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalLeads) * 100,
      }))
      .sort((a, b) => b.count - a.count);
    
    const freshMetrics: CachedMetrics = {
      totalLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      topSources,
      statusDistribution,
      lastCalculated: now
    };
    
    // Update cache
    metricsCache.set(cacheKey, freshMetrics);
    
    return freshMetrics;
  }, [leads, cacheKey]);
  
  const invalidateCache = (key?: string) => {
    if (key) {
      metricsCache.delete(key);
    } else {
      metricsCache.clear();
    }
  };
  
  const getCacheInfo = () => {
    const cached = metricsCache.get(cacheKey);
    if (!cached) return null;
    
    const age = Date.now() - cached.lastCalculated;
    const remaining = Math.max(0, CACHE_DURATION - age);
    
    return {
      age: Math.round(age / 1000), // seconds
      remaining: Math.round(remaining / 1000), // seconds
      isValid: remaining > 0
    };
  };
  
  return {
    metrics: cachedMetrics,
    invalidateCache,
    getCacheInfo,
    isCached: metricsCache.has(cacheKey)
  };
};