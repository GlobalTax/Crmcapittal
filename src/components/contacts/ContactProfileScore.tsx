import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, XCircle, ChevronDown, Target } from 'lucide-react';
import { useContactProfileScore } from '@/hooks/useContactProfileScore';
import { Contact } from '@/types/Contact';

interface ContactProfileScoreProps {
  contact: Contact;
}

export const ContactProfileScore = ({ contact }: ContactProfileScoreProps) => {
  const profileScore = useContactProfileScore(contact);
  const { score, level, color, categories, totalCompleted, totalFields } = profileScore;

  const getLevelText = (level: string) => {
    switch (level) {
      case 'excellent': return 'Excelente';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Sin datos';
    }
  };

  const getLevelVariant = (level: string) => {
    switch (level) {
      case 'excellent': return 'default';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Score de Contacto</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs text-muted-foreground">ⓘ</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">Objetivo: ≥85 puntos</p>
                    <ul className="text-xs space-y-1">
                      <li>• Canales/Consent (20%)</li>
                      <li>• Classification (15%)</li>
                      <li>• Interés/Capacidad (25%)</li>
                      <li>• Geo/Sector (20%)</li>
                      <li>• Idioma/Timezone (10%)</li>
                      <li>• Email/Teléfono válido (10%)</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant={getLevelVariant(level)}>
            {getLevelText(level)}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold" style={{ color }}>
              {score}%
            </span>
            <span className="text-xs text-muted-foreground">
              {totalCompleted} de {totalFields} campos
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={score} 
              className="h-3"
              style={{ 
                ['--progress-foreground' as any]: color 
              }}
            />
            {score >= 85 && (
              <div className="flex items-center gap-1 text-xs text-success">
                <CheckCircle2 className="h-3 w-3" />
                ¡Objetivo alcanzado!
              </div>
            )}
          </div>

          {/* Categories breakdown */}
          <div className="space-y-2 mt-4">
            {categories.map((category, index) => (
              <Collapsible key={index}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm hover:bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({category.points}/{category.maxPoints})
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="space-y-1">
                    {category.completedFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        {field}
                      </div>
                    ))}
                    {category.missingFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <XCircle className="h-3 w-3" />
                        {field}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};