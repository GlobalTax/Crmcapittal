
import { useState } from "react";
import { PipelinesDashboard } from "@/components/pipelines/PipelinesDashboard";
import { FlexibleKanbanPipeline } from "@/components/sourcing/FlexibleKanbanPipeline";
import { Pipeline } from "@/types/Pipeline";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ViewMode = 'dashboard' | 'kanban';

export default function PipelinesManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  const handleViewPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setViewMode('kanban');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedPipeline(null);
  };

  return (
    <div className="space-y-6">
      {viewMode === 'dashboard' ? (
        <PipelinesDashboard
          onViewPipeline={handleViewPipeline}
          onEditPipeline={(pipeline) => {
            // TODO: Implementar edición de pipelines
            console.log('Edit pipeline:', pipeline);
          }}
          onCreatePipeline={() => {
            // TODO: Implementar creación de pipelines
            console.log('Create pipeline');
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
            {selectedPipeline && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedPipeline.name}
                </h1>
                {selectedPipeline.description && (
                  <p className="text-gray-600">{selectedPipeline.description}</p>
                )}
              </div>
            )}
          </div>
          
          <FlexibleKanbanPipeline
            pipelineType={selectedPipeline?.type || 'TARGET_COMPANY'}
            pipelineId={selectedPipeline?.id}
            onToggleView={() => {
              // TODO: Implementar vista de tabla
              console.log('Toggle to table view');
            }}
          />
        </div>
      )}
    </div>
  );
}
