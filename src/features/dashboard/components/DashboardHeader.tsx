/**
 * Dashboard Header Component
 * 
 * Header component for dashboard with user info and role badge
 */

import React from 'react';
import { Badge } from '@/shared/components/ui';
import { useAuth } from '@/features/auth';
import { DashboardHeaderProps } from '../types';

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ role }) => {
  const { user } = useAuth();

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-card-foreground">Dashboard M&A</h1>
          <p className="text-muted-foreground mt-1">
            Hola {user?.email?.split('@')[0] || 'Usuario'}, aquí tienes tu resumen de actividad
          </p>
        </div>
        <div className="flex items-center">
          <Badge variant="secondary">
            {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </div>
      </div>
    </div>
  );
};