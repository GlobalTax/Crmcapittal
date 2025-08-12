import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  children, 
  badge,
  actions 
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-end gap-3">
          {actions}
        </div>
        {children && (
          <div className="space-y-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}