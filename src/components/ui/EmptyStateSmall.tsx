import React from 'react';

interface EmptyStateSmallProps {
  icon: React.ReactNode;
  text: string;
  action?: React.ReactNode;
}

export const EmptyStateSmall = ({ icon, text, action }: EmptyStateSmallProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {text}
      </p>
      {action}
    </div>
  );
};