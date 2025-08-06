import React from 'react';
import { cn } from '@/lib/utils';

interface StandardDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '7xl' | '6xl' | '5xl' | '4xl' | 'full';
  spacing?: 'default' | 'tight' | 'loose';
}

export const StandardDashboardLayout: React.FC<StandardDashboardLayoutProps> = ({
  children,
  className,
  maxWidth = '7xl',
  spacing = 'default'
}) => {
  const maxWidthStyles = {
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
    '4xl': 'max-w-4xl',
    'full': 'max-w-full'
  };

  const spacingStyles = {
    'default': 'space-y-8',
    'tight': 'space-y-6',
    'loose': 'space-y-10'
  };

  return (
    <div className={cn(
      "mx-auto",
      maxWidthStyles[maxWidth],
      spacingStyles[spacing],
      className
    )}>
      {children}
    </div>
  );
};