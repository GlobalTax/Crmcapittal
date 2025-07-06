import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ProfileScore {
  score: number;
  level: 'low' | 'medium' | 'high';
  color: string;
  completedFields: string[];
  missingFields: string[];
}

interface CompanyProfileScoreProps {
  profileScore: ProfileScore;
}

export const CompanyProfileScore = ({ profileScore }: CompanyProfileScoreProps) => {
  const { score, level, color, completedFields, missingFields } = profileScore;

  const getLevelText = (level: string) => {
    switch (level) {
      case 'high': return 'Excelente';
      case 'medium': return 'Bueno';
      case 'low': return 'Básico';
      default: return 'Sin datos';
    }
  };

  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Puntuación del perfil</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">Cálculo basado en:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Datos básicos (20%)</li>
                      <li>• Datos comerciales (30%)</li>
                      <li>• Datos eInforma (30%)</li>
                      <li>• Actividad CRM (20%)</li>
                    </ul>
                    {missingFields.length > 0 && (
                      <>
                        <p className="font-medium text-destructive">Campos faltantes:</p>
                        <ul className="text-xs space-y-1">
                          {missingFields.slice(0, 5).map((field, index) => (
                            <li key={index}>• {field}</li>
                          ))}
                          {missingFields.length > 5 && (
                            <li>• ... y {missingFields.length - 5} más</li>
                          )}
                        </ul>
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant={getLevelVariant(level)}>
            {getLevelText(level)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold" style={{ color }}>
              {score}%
            </span>
            <span className="text-xs text-muted-foreground">
              {completedFields.length} de {completedFields.length + missingFields.length} campos
            </span>
          </div>
          <Progress 
            value={score} 
            className="h-2"
            style={{ 
              ['--progress-foreground' as any]: color 
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};