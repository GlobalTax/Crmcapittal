import { useState, useMemo } from 'react';
import type { Valoracion } from '@/types/Valoracion';

interface SearchFilters {
  search: string;
  status: string;
  priority: string;
  paymentStatus: string;
}

export const useValoracionesSearch = (valoraciones: Valoracion[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    paymentStatus: 'all'
  });

  const filteredValoraciones = useMemo(() => {
    return valoraciones.filter(valoracion => {
      // Búsqueda por texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          valoracion.company_name?.toLowerCase().includes(searchTerm) ||
          valoracion.client_name?.toLowerCase().includes(searchTerm) ||
          valoracion.company_sector?.toLowerCase().includes(searchTerm) ||
          valoracion.assigned_to?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (filters.status !== 'all' && valoracion.status !== filters.status) {
        return false;
      }

      // Filtro por prioridad
      if (filters.priority !== 'all' && valoracion.priority !== filters.priority) {
        return false;
      }

      // Filtro por estado de pago
      if (filters.paymentStatus !== 'all' && valoracion.payment_status !== filters.paymentStatus) {
        return false;
      }

      return true;
    });
  }, [valoraciones, filters]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      paymentStatus: 'all'
    });
  };

  const hasActiveFilters = filters.search !== '' || 
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.paymentStatus !== 'all';

  return {
    filters,
    filteredValoraciones,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    totalCount: valoraciones.length,
    filteredCount: filteredValoraciones.length
  };
};