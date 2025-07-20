
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Users, Clock } from 'lucide-react';

interface MandateProgressProps {
  totalTargets: number;
  contactedTargets: number;
  showTitle?: boolean;
  className?: string;
}

export const MandateProgress = ({ 
  totalTargets, 
  contactedTargets, 
  showTitle = true, 
  className = "" 
}: MandateProgressProps) => {
  const completionRate = totalTargets > 0 ? Math.round((contactedTargets / totalTargets) * 100) : 0;
  const remainingTargets = totalTargets - contactedTargets;

  const getProgressColor = (rate: number) => {
    if (rate >= 75) return 'text-green-600';
    if (rate >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressStatus = (rate: number) => {
    if (rate >= 75) return { label: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (rate >= 50) return { label: 'Bueno', color: 'bg-orange-100 text-orange-800' };
    if (rate >= 25) return { label: 'En progreso', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Inicial', color: 'bg-gray-100 text-gray-800' };
  };

  const progressStatus = getProgressStatus(completionRate);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progreso del Mandato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progreso principal */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Completado</span>
            <span className={`text-lg font-bold ${getProgressColor(completionRate)}`}>
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <Badge className={progressStatus.color} variant="outline">
            {progressStatus.label}
          </Badge>
        </div>

        {/* Métricas detalladas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{totalTargets}</span>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Contactados</span>
            </div>
            <span className="text-lg font-bold text-green-600">{contactedTargets}</span>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pendientes por contactar:</span>
            <span className="font-medium">{remainingTargets}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tasa de contacto:</span>
            <span className="font-medium">{completionRate}%</span>
          </div>

          {totalTargets > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Promedio semanal:</span>
              <span className="font-medium">~{Math.ceil(contactedTargets / 2)} targets</span>
            </div>
          )}
        </div>

        {/* Proyección */}
        {remainingTargets > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Proyección</span>
            </div>
            <p className="text-xs text-blue-700">
              Al ritmo actual, completarás el mandato en aproximadamente{' '}
              <span className="font-medium">
                {Math.ceil(remainingTargets / Math.max(1, contactedTargets / 2))} semanas
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
