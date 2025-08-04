/**
 * Dashboard Types
 * 
 * All types related to dashboard functionality
 */

import { LucideIcon } from 'lucide-react';

// Core dashboard types (DashboardCard interface removed to avoid conflict with component)

export interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  description: string;
  icon: LucideIcon;
}

export interface QuickAction {
  title: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'lead' | 'deal' | 'task' | 'call' | 'email' | 'completed' | 'operation' | 'user';
  description: string;
  timestamp: Date;
  user?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DashboardMetrics {
  kpiMetrics: KPIMetric[];
  availableOperations: any[];
  inProcessOperations: any[];
  soldOperations: any[];
  totalPortfolioValue: number;
  conversionRate: number;
}

// Dashboard props interfaces
export interface DashboardHeaderProps {
  role: string | null;
}

export interface KPIMetricsProps {
  metrics: KPIMetric[];
}

export interface QuickActionsProps {
  actions: QuickAction[];
  role: string | null;
}

export interface ActivityFeedProps {
  className?: string;
  activities?: ActivityItem[];
}

export interface DashboardCardProps {
  title: string;
  metric?: string | number;
  diff?: number;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

// Legacy exports for backward compatibility
// export * from '@/types/dashboard'; // Will be uncommented once legacy types are migrated