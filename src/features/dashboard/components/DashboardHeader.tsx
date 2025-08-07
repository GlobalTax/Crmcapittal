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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Personal</h1>
        <div className="flex items-center">
          <Badge variant="secondary">
            {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </div>
      </div>
    </div>
  );
};