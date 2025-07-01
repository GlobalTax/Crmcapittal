
import { useState } from 'react';
import { Negocio } from "@/types/Negocio";

type SortField = 'nombre_negocio' | 'valor_negocio' | 'created_at' | 'prioridad' | 'company_name';
type SortDirection = 'asc' | 'desc';

export const useNegociosTableSorting = (negocios: Negocio[]) => {
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

  const sortedNegocios = [...negocios].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'company_name') {
      aValue = a.company?.name || '';
      bValue = b.company?.name || '';
    } else if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (sortField === 'valor_negocio') {
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
    sortedNegocios,
    handleSort
  };
};
