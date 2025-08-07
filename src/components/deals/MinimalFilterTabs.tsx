import React from 'react';

interface MinimalFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MinimalFilterTabs = ({ activeTab, onTabChange }: MinimalFilterTabsProps) => {
  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'mine', label: 'Míos' },
    { id: 'no-activity', label: 'Sin actividad' },
    { id: 'closing-soon', label: 'Cierre próximo' },
    { id: 'at-risk', label: 'En riesgo' }
  ];

  return (
    <div className="flex gap-6 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};