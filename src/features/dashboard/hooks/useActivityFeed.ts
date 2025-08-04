/**
 * Activity Feed Hook
 * 
 * Hook for generating and managing activity feed data
 */

import { useMemo } from 'react';
import { ActivityItem } from '../types';

export const useActivityFeed = (operations: any[], leads: any[], negocios: any[]): ActivityItem[] => {
  return useMemo(() => {
    const activities: ActivityItem[] = [];
    
    // Process only the most recent items to avoid unnecessary computation
    const recentOps = operations.length > 0 ? operations.slice(0, 3) : [];
    const recentNegocios = negocios.length > 0 ? negocios.slice(0, 2) : [];
    const recentLeads = leads.length > 0 ? leads.slice(0, 2) : [];
    
    // Add recent operations with error handling
    recentOps.forEach(op => {
      if (op?.id) {
        activities.push({
          id: `op-${op.id}`,
          type: 'operation',
          description: `Nueva operación "${op.company_name || 'Sin nombre'}" por €${((op.amount || 0) / 1000000).toFixed(1)}M`,
          timestamp: new Date(op.created_at || Date.now()),
          user: op.manager?.name || 'Sistema',
          priority: (op.amount || 0) > 10000000 ? 'high' : 'medium'
        });
      }
    });

    // Add recent negocios with error handling
    recentNegocios.forEach(negocio => {
      if (negocio?.id) {
        activities.push({
          id: `neg-${negocio.id}`,
          type: 'deal',
          description: `Negocio "${negocio.nombre_negocio || 'Sin nombre'}" actualizado`,
          timestamp: new Date(negocio.updated_at || Date.now()),
          user: negocio.propietario_negocio || 'Sistema',
          priority: negocio.prioridad === 'urgente' ? 'high' : 'medium'
        });
      }
    });

    // Add recent leads with error handling
    recentLeads.forEach(lead => {
      if (lead?.id) {
        activities.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          description: `Nuevo lead "${lead.company_name || lead.name || 'Sin nombre'}" registrado`,
          timestamp: new Date(lead.created_at || Date.now()),
          user: 'Sistema',
          priority: 'low'
        });
      }
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  }, [operations, negocios, leads]);
};