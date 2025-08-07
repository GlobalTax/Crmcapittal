import React from 'react';

interface MinimalFilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const MinimalFilterTabs = ({ activeFilter, onFilterChange }: MinimalFilterTabsProps) => {
  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Activos' },
    { id: 'inactive', label: 'Sin actividad' },
    { id: 'vip', label: 'VIPs' }
  ];

  return (
    <div className="flex items-center gap-6 mb-6 border-b border-slate-200">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            activeFilter === filter.id
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};