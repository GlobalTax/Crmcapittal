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
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        {actionButtons}
      </div>
    </div>
  );
};