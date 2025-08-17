import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Stage } from '@/types/Pipeline';
import { PipelineStage } from '@/hooks/leads/usePipelineStages';
import { Lead } from '@/types/Lead';
import { updateLead } from '@/services/leadsService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  key: string;
  label: string;
  required?: boolean;
}

interface StageChecklistProps {
  stage: Stage | PipelineStage;
  leadId: string;
  leadData: Lead;
  className?: string;
}

export const StageChecklist = ({ stage, leadId, leadData, className }: StageChecklistProps) => {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Get checklist items from stage configuration
  const items: ChecklistItem[] = stage.stage_config?.checklist ?? [];

  // Get progress from leadData.extra
  const progress = leadData.extra?.stage_checklist?.[stage.id] ?? {};

  const handleItemToggle = async (itemKey: string, checked: boolean) => {
    if (updatingItems.has(itemKey)) return;

    setUpdatingItems(prev => new Set(prev).add(itemKey));

    try {
      // Merge the new progress with existing extra data
      const newExtra = {
        ...leadData.extra,
        stage_checklist: {
          ...leadData.extra?.stage_checklist,
          [stage.id]: {
            ...leadData.extra?.stage_checklist?.[stage.id],
            [itemKey]: checked
          }
        }
      };

      await updateLead(leadId, { extra: newExtra });
      
      // Update local leadData reference is handled by parent component's refetch
      toast.success(checked ? 'Item marcado como completado' : 'Item marcado como pendiente');
    } catch (error) {
      console.error('Error updating checklist progress:', error);
      toast.error('Error al actualizar el progreso del checklist');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium text-foreground mb-2">
        Checklist de la etapa
      </h4>
      <div className="space-y-1.5">
        {items.map((item) => {
          const isChecked = progress[item.key] === true;
          const isUpdating = updatingItems.has(item.key);

          return (
            <div 
              key={item.key}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-sm transition-colors",
                "hover:bg-muted/50",
                isChecked && "bg-muted/30"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => handleItemToggle(item.key, checked as boolean)}
                disabled={isUpdating}
                className="shrink-0"
              />
              
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className={cn(
                  "text-sm",
                  isChecked ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {item.label}
                </span>
                
                {item.required && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    Requerida
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};