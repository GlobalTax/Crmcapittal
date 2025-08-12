import React from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';

interface RevealSectionProps {
  storageKey: string;
  title?: string;
  count?: number;
  defaultCollapsed?: boolean;
  collapsedLabel?: string;
  expandedLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export const RevealSection: React.FC<RevealSectionProps> = ({
  storageKey,
  title,
  count,
  defaultCollapsed = true,
  collapsedLabel = 'Mostrar tarjetas',
  expandedLabel = 'Ocultar tarjetas',
  className = '',
  children,
}) => {
  const [collapsed, setCollapsed] = usePersistentState<boolean>(`reveal:${storageKey}`, defaultCollapsed);

  const label = collapsed ? collapsedLabel : expandedLabel;
  const countText = typeof count === 'number' ? ` (${count})` : '';

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-3">
        {title ? (
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        ) : <span />}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent/10 transition"
          aria-expanded={!collapsed}
        >
          {label}{countText}
        </button>
      </div>
      {!collapsed && (
        <div className="contents">
          {children}
        </div>
      )}
    </section>
  );
};
