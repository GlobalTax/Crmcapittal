import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Workflow, ChevronDown } from 'lucide-react';
import { usePipelines } from '@/hooks/usePipelines';
import { Pipeline, PipelineType } from '@/types/Pipeline';

interface PipelineSelectorProps {
  selectedPipelineId?: string;
  onPipelineChange: (pipelineId: string) => void;
  pipelineType?: PipelineType;
  className?: string;
}

/**
 * PipelineSelector Component
 * 
 * Dropdown selector for choosing active pipeline in Kanban view.
 * Persists selection in localStorage and shows pipeline statistics.
 * 
 * @param selectedPipelineId - Currently selected pipeline ID
 * @param onPipelineChange - Callback when pipeline selection changes
 * @param pipelineType - Filter pipelines by type (default: 'DEAL')
 * @param className - Additional CSS classes
 */
export const PipelineSelector = ({ 
  selectedPipelineId, 
  onPipelineChange, 
  pipelineType = 'DEAL',
  className = '' 
}: PipelineSelectorProps) => {
  const { pipelines, loading, authReady } = usePipelines();
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(selectedPipelineId);

  /**
   * Filter pipelines by type
   */
  const filteredPipelines = pipelines.filter(p => p.type === pipelineType);

  /**
   * Get the currently selected pipeline object
   */
  const selectedPipeline = filteredPipelines.find(p => p.id === localSelectedId);

  /**
   * Handle pipeline selection change
   */
  const handlePipelineChange = (pipelineId: string) => {
    setLocalSelectedId(pipelineId);
    onPipelineChange(pipelineId);
    
    // Persist selection in localStorage
    localStorage.setItem(`selected-pipeline-${pipelineType}`, pipelineId);
  };

  /**
   * Load saved pipeline selection from localStorage
   */
  useEffect(() => {
    // Only proceed if auth is ready and pipelines are loaded
    if (!authReady || loading || filteredPipelines.length === 0) return;
    
    // Don't override if already selected
    if (selectedPipelineId || localSelectedId) return;
    
    const savedPipelineId = localStorage.getItem(`selected-pipeline-${pipelineType}`);
    
    if (savedPipelineId && filteredPipelines.some(p => p.id === savedPipelineId)) {
      setLocalSelectedId(savedPipelineId);
      onPipelineChange(savedPipelineId);
    } else if (filteredPipelines.length > 0) {
      // Default to first available pipeline
      const defaultPipeline = filteredPipelines[0];
      setLocalSelectedId(defaultPipeline.id);
      onPipelineChange(defaultPipeline.id);
    }
  }, [filteredPipelines, selectedPipelineId, localSelectedId, onPipelineChange, pipelineType, authReady, loading]);

  // Show loading state while auth is not ready or while loading
  if (!authReady || loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Workflow className="h-4 w-4 text-muted-foreground animate-pulse" />
        <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (filteredPipelines.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Workflow className="h-4 w-4" />
        <span className="text-sm">No hay pipelines disponibles</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Workflow className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Pipeline:</span>
      </div>
      
      <Select value={localSelectedId || ''} onValueChange={handlePipelineChange}>
        <SelectTrigger className="w-60 bg-background">
          <SelectValue placeholder="Seleccionar pipeline">
            {selectedPipeline && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedPipeline.name}</span>
                {selectedPipeline.description && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedPipeline.type}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background border border-border shadow-md">
          {filteredPipelines.map((pipeline) => (
            <SelectItem key={pipeline.id} value={pipeline.id}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pipeline.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {pipeline.type}
                  </Badge>
                </div>
                {pipeline.description && (
                  <span className="text-xs text-muted-foreground">
                    {pipeline.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Pipeline Info */}
      {selectedPipeline && (
        <Badge variant="outline" className="text-xs">
          Activo
        </Badge>
      )}
    </div>
  );
};