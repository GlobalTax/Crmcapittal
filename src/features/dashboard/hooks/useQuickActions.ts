/**
 * Quick Actions Hook
 * 
 * Hook for generating role-based quick actions
 */

import { useMemo } from 'react';
import { Users, TrendingUp, FileText, Calendar, Building2, Settings } from 'lucide-react';
import { QuickAction } from '../types';

export const useQuickActions = (role: string | null): QuickAction[] => {
  return useMemo(() => {
    const baseActions: QuickAction[] = [
      {
        title: "Nuevo Contacto",
        icon: Users,
        href: "/contacts",
        color: "blue"
      },
      {
        title: "Ver Negocios",
        icon: TrendingUp,
        href: "/negocios",
        color: "green"
      },
      {
        title: "Documentos",
        icon: FileText,
        href: "/documents",
        color: "purple"
      },
      {
        title: "Mi Calendario",
        icon: Calendar,
        href: "/calendar",
        color: "orange"
      }
    ];

    if (role === 'admin' || role === 'superadmin') {
      baseActions.unshift(
        {
          title: "Gestión Leads",
          icon: Building2,
          href: "/leads",
          color: "red"
        },
        {
          title: "Administración",
          icon: Settings,
          href: "/admin",
          color: "gray"
        }
      );
    }

    return baseActions;
  }, [role]);
};