
import { useState } from 'react';
import { Deal } from "@/types/Deal";

type SortField = 'deal_name' | 'company_name' | 'deal_value' | 'created_at' | 'priority';
type SortDirection = 'asc' | 'desc';

export const useDealsTableSorting = (deals: Deal[]) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDeals = [...deals].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (sortField === 'deal_value') {
      aValue = aValue || 0;
      bValue = bValue || 0;
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue || '').toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return {
    sortedDeals,
    handleSort
  };
};
