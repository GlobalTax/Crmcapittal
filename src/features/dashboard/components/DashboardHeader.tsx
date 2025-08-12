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

  return null;
};
