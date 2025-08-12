/**
 * Standard Page Header Component
 * 
 * Componente estandarizado para todas las páginas del sistema
 * Implementa el patrón único: título principal sin subtítulos + botones de acción
 */

import React from 'react';

interface StandardPageHeaderProps {
  title: string;
  actionButtons?: React.ReactNode;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({ 
  title, 
  actionButtons 
}) => {
  return (
    <div className="mb-6 flex items-center justify-end">
      <div className="flex items-center gap-3">
        {actionButtons}
      </div>
    </div>
  );
};