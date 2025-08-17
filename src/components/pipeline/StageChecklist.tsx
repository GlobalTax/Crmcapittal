import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeadChecklistProgress } from '@/hooks/leads/useLeadChecklistProgress';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageChecklistProps {
  stageId: string;
  leadId: string;
  className?: string;
}

export const StageChecklist = ({ stageId, leadId, className }: StageChecklistProps) => {
  const {
    items,
    isLoading,
    error,
    toggleProgress,
    completeAll,
    isToggling,
    isCompletingAll,
    stats,
    completionPercentage,
    requiredCompletionPercentage,
    isRequiredComplete
  } = useLeadChecklistProgress(leadId, stageId);

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Error al cargar el checklist</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay elementos en el checklist</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleToggleProgress = (itemId: string, completed: boolean) => {
    toggleProgress({
      lead_id: leadId,
      item_id: itemId,
      stage_id: stageId,
      completed
    });
  };

  const handleCompleteAll = () => {
    completeAll();
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Checklist de Etapa
          </CardTitle>
          {stats.total > 0 && stats.completed < stats.total && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCompleteAll}
              disabled={isCompletingAll}
              className="text-xs"
            >
              {isCompletingAll ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                "Completar todos"
              )}
            </Button>
          )}
        </div>
        
        {/* Progress Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progreso general</span>
            <span>{stats.completed} de {stats.total} completados</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          {stats.required > 0 && (
            <>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Items requeridos</span>
                <span className={cn(
                  "font-medium",
                  isRequiredComplete ? "text-green-600" : "text-amber-600"
                )}>
                  {stats.requiredCompleted} de {stats.required}
                </span>
              </div>
              <Progress 
                value={requiredCompletionPercentage} 
                className="h-1.5"
              />
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id}
            className={cn(
              "flex items-center space-x-3 p-2 rounded-md transition-colors",
              "hover:bg-muted/50",
              item.completed && "bg-muted/30"
            )}
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={(checked) => 
                handleToggleProgress(item.id, checked as boolean)
              }
              disabled={isToggling}
              className="shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  item.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {item.label}
                </span>
                
                {item.is_required && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    Requerida
                  </Badge>
                )}
              </div>
              
              {item.completed && item.completed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completado {new Date(item.completed_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};