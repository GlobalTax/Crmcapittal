import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface LeadScoreWidgetProps {
  score: number;
  className?: string;
}

export const LeadScoreWidget = ({ score, className = "" }: LeadScoreWidgetProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 76) return 'hsl(158, 100%, 38%)'; // Verde
    if (score >= 51) return 'hsl(42, 100%, 50%)'; // Amarillo
    if (score >= 26) return 'hsl(30, 100%, 50%)'; // Naranja
    return 'hsl(4, 86%, 63%)'; // Rojo
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Lead Score</span>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="100" height="100" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth="6"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={getScoreColor(score)}
                strokeWidth="6"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Score text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{score}</div>
                <div className="text-xs text-muted-foreground">%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">
            {score >= 76 ? 'Excelente' : score >= 51 ? 'Bueno' : score >= 26 ? 'Regular' : 'Bajo'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};