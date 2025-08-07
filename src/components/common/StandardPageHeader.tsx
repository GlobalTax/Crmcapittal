/**
 * Standard Page Header Component
 * 
 * Standardized header for all CRM functionalities
 * Implements the single pattern: title only + action buttons
 */

import React from 'react';

interface StandardPageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({ 
  title, 
  children 
}) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};