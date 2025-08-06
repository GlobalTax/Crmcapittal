import { useMemo, useState } from 'react';
import { Lead, LeadStatus, LeadSource, LeadPriority, LeadQuality } from '@/types/Lead';
import { useDebounce } from './useDebounce';

export interface AdvancedFilters {
  search: string;
  status: LeadStatus | 'all';
  source: LeadSource | 'all';
  priority: LeadPriority | 'all';
  quality: LeadQuality | 'all';
  assignedTo: string | 'all' | 'unassigned';
  scoreRange: [number, number];
  dateRange: {
    from: string;
    to: string;
  } | null;
  tags: string[];
}

const defaultFilters: AdvancedFilters = {
  search: '',
  status: 'all',
  source: 'all',
  priority: 'all',
  quality: 'all',
  assignedTo: 'all',
  scoreRange: [0, 100],
  dateRange: null,
  tags: []
};

export const useAdvancedLeadFilters = (leads: Lead[]) => {
  const [filters, setFilters] = useState<AdvancedFilters>(defaultFilters);
  const debouncedSearch = useDebounce(filters.search, 300);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter (name, email, company)
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase();
        const matchesSearch = 
          lead.name.toLowerCase().includes(searchTerm) ||
          lead.email.toLowerCase().includes(searchTerm) ||
          (lead.company_name?.toLowerCase().includes(searchTerm)) ||
          (lead.phone?.includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // Source filter
      if (filters.source !== 'all' && lead.source !== filters.source) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && lead.priority !== filters.priority) {
        return false;
      }

      // Quality filter
      if (filters.quality !== 'all' && lead.quality !== filters.quality) {
        return false;
      }

      // Assigned to filter
      if (filters.assignedTo !== 'all') {
        if (filters.assignedTo === 'unassigned' && lead.assigned_to_id) {
          return false;
        }
        if (filters.assignedTo !== 'unassigned' && lead.assigned_to_id !== filters.assignedTo) {
          return false;
        }
      }

      // Score range filter
      if (lead.lead_score < filters.scoreRange[0] || lead.lead_score > filters.scoreRange[1]) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const leadDate = new Date(lead.created_at);
        const fromDate = new Date(filters.dateRange.from);
        const toDate = new Date(filters.dateRange.to);
        
        if (leadDate < fromDate || leadDate > toDate) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const leadTags = lead.tags || [];
        const hasAllTags = filters.tags.every(tag => leadTags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [leads, filters, debouncedSearch]);

  const updateFilter = <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.source !== 'all' ||
      filters.priority !== 'all' ||
      filters.quality !== 'all' ||
      filters.assignedTo !== 'all' ||
      filters.scoreRange[0] !== 0 ||
      filters.scoreRange[1] !== 100 ||
      filters.dateRange !== null ||
      filters.tags.length > 0
    );
  }, [filters]);

  const filterStats = useMemo(() => {
    const total = leads.length;
    const filtered = filteredLeads.length;
    const hidden = total - filtered;
    
    return {
      total,
      filtered,
      hidden,
      percentage: total > 0 ? Math.round((filtered / total) * 100) : 0
    };
  }, [leads.length, filteredLeads.length]);

  return {
    filters,
    filteredLeads,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterStats
  };
};