/**
 * Quick Actions Component
 * 
 * Panel with quick action buttons for common tasks
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui';
import { DashboardCard } from './DashboardCard';
import { QuickActionsProps } from '../types';

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, role }) => {
  return (
    <DashboardCard title="Acciones Rápidas">
      <div className="space-y-2">
        {actions.map((action, index) => {
          if ((action.href === '/leads' || action.href === '/admin') && role === 'user') return null;
          
          return (
            <Link key={index} to={action.href}>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-accent hover:text-primary"
              >
                <action.icon className="h-4 w-4 mr-3" />
                {action.title}
              </Button>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
};