import React from 'react';

interface TransaccionProgressBarProps {
  stage: string;
}

export const TransaccionProgressBar = ({ stage }: TransaccionProgressBarProps) => {
  const getProgress = (stage: string) => {
    const stages: Record<string, number> = {
      'Lead': 25,
      'In Progress': 50,
      'Won': 100,
      'Lost': 0
    };
    return stages[stage] || 25;
  };

  const getColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Lead': 'bg-blue-500',
      'In Progress': 'bg-yellow-500',
      'Won': 'bg-green-500',
      'Lost': 'bg-red-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  const progress = getProgress(stage);
  const colorClass = getColor(stage);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};