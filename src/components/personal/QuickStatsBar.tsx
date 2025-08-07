import React from 'react';
import { cn } from '@/lib/utils';

interface QuickStat {
  label: string;
  value: number;
  onClick?: () => void;
}

interface QuickStatsBarProps {
  stats: QuickStat[];
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({ stats }) => {
  return (
    <div className="text-sm text-slate-600 border-t border-slate-200 pt-4 mt-4">
      <div className="flex items-center justify-center gap-4">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <button
              className={cn(
                "hover:text-blue-600 transition-colors",
                stat.onClick && "cursor-pointer"
              )}
              onClick={stat.onClick}
            >
              <span className="font-medium">{stat.value}</span> {stat.label}
            </button>
            {index < stats.length - 1 && (
              <span className="text-slate-400">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};