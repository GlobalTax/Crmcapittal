import { useState, useEffect, useMemo } from 'react';
import { useTransacciones } from './useTransacciones';
import { Transaccion } from '@/types/Transaccion';

interface TransaccionFilters {
  search?: string;
  stage?: string;
  owner?: string;
  valueRange?: string;
  quickFilters?: string[];
}

interface TransaccionStats {
  totalValue: number;
  activeCount: number;
  closingSoonCount: number;
  inactiveCount: number;
  myCount: number;
}

export const useTransaccionesOptimized = (filters: TransaccionFilters) => {
  const { transacciones, loading, error, ...mutations } = useTransacciones();
  
  // Filtros aplicados
  const filteredTransacciones = useMemo(() => {
    let filtered = [...transacciones];

    // Filtro de búsqueda inteligente
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t => {
        // Búsqueda por nombre de transacción
        if (t.nombre_transaccion?.toLowerCase().includes(searchTerm)) return true;
        
        // Búsqueda por empresa
        if (t.company?.name?.toLowerCase().includes(searchTerm)) return true;
        
        // Búsqueda por valor (ej: "valor >500000")
        if (searchTerm.includes('valor >')) {
          const valueThreshold = parseInt(searchTerm.replace('valor >', '').replace('k', '000').replace('m', '000000'));
          return (t.valor_transaccion || 0) > valueThreshold;
        }
        
        // Búsqueda por sector
        if (t.sector?.toLowerCase().includes(searchTerm)) return true;
        
        return false;
      });
    }

    // Filtro por etapa
    if (filters.stage && filters.stage !== 'all') {
      filtered = filtered.filter(t => t.stage?.id === filters.stage);
    }

    // Filtro por propietario
    if (filters.owner && filters.owner !== 'all') {
      if (filters.owner === 'me') {
        // En implementación real, compararíamos con auth.uid()
        filtered = filtered.filter(t => t.propietario_transaccion === 'current_user');
      } else if (filters.owner === 'unassigned') {
        filtered = filtered.filter(t => !t.propietario_transaccion);
      } else {
        filtered = filtered.filter(t => t.propietario_transaccion === filters.owner);
      }
    }

    // Filtro por rango de valor
    if (filters.valueRange && filters.valueRange !== 'all') {
      switch (filters.valueRange) {
        case 'high':
          filtered = filtered.filter(t => (t.valor_transaccion || 0) >= 1000000);
          break;
        case 'medium':
          filtered = filtered.filter(t => {
            const value = t.valor_transaccion || 0;
            return value >= 500000 && value < 1000000;
          });
          break;
        case 'low':
          filtered = filtered.filter(t => (t.valor_transaccion || 0) < 500000);
          break;
      }
    }

    // Quick filters
    if (filters.quickFilters?.length) {
      filters.quickFilters.forEach(filter => {
        switch (filter) {
          case 'mias':
            // En implementación real, compararíamos con auth.uid()
            filtered = filtered.filter(t => t.propietario_transaccion === 'current_user');
            break;
          case 'cierre_proximo':
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            filtered = filtered.filter(t => {
              if (!t.fecha_cierre) return false;
              const fechaCierre = new Date(t.fecha_cierre);
              return fechaCierre <= thirtyDaysFromNow && fechaCierre >= new Date();
            });
            break;
          case 'sin_actividad':
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(t => new Date(t.updated_at) < sevenDaysAgo);
            break;
          case 'urgentes':
            filtered = filtered.filter(t => t.prioridad === 'urgente');
            break;
        }
      });
    }

    return filtered;
  }, [transacciones, filters]);

  // Estadísticas calculadas
  const stats = useMemo<TransaccionStats>(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeTransacciones = transacciones.filter(t => t.is_active);
    
    return {
      totalValue: activeTransacciones.reduce((sum, t) => sum + (t.valor_transaccion || 0), 0),
      activeCount: activeTransacciones.length,
      closingSoonCount: activeTransacciones.filter(t => {
        if (!t.fecha_cierre) return false;
        const fechaCierre = new Date(t.fecha_cierre);
        return fechaCierre <= thirtyDaysFromNow && fechaCierre >= now;
      }).length,
      inactiveCount: activeTransacciones.filter(t => 
        new Date(t.updated_at) < sevenDaysAgo
      ).length,
      myCount: activeTransacciones.filter(t => 
        t.propietario_transaccion === 'current_user' // En implementación real sería auth.uid()
      ).length
    };
  }, [transacciones]);

  return {
    transacciones: filteredTransacciones,
    allTransacciones: transacciones,
    loading,
    error,
    stats,
    hasActiveFilters: Object.values(filters).some(v => 
      v && (Array.isArray(v) ? v.length > 0 : (v !== '' && v !== 'all'))
    ),
    ...mutations
  };
};