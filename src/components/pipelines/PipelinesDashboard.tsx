
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePipelines } from "@/hooks/usePipelines";
import { useStages } from "@/hooks/useStages";
import { Pipeline, PipelineType } from "@/types/Pipeline";
import { BarChart3, Plus, Settings, Eye } from "lucide-react";
import { useState } from "react";

const typeLabels: Record<PipelineType, string> = {
  'OPERACION': 'Operaciones',
  'PROYECTO': 'Proyectos',
  'LEAD': 'Leads',
  'TARGET_COMPANY': 'Empresas Objetivo'
};

const typeColors: Record<PipelineType, string> = {
  'OPERACION': 'bg-blue-100 text-blue-800',
  'PROYECTO': 'bg-green-100 text-green-800',
  'LEAD': 'bg-yellow-100 text-yellow-800',
  'TARGET_COMPANY': 'bg-purple-100 text-purple-800'
};

interface PipelineCardProps {
  pipeline: Pipeline;
  stagesCount: number;
  onView: (pipeline: Pipeline) => void;
  onSettings: (pipeline: Pipeline) => void;
}

const PipelineCard = ({ pipeline, stagesCount, onView, onSettings }: PipelineCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{pipeline.name}</CardTitle>
            <Badge className={typeColors[pipeline.type]}>
              {typeLabels[pipeline.type]}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(pipeline)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSettings(pipeline)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pipeline.description && (
            <p className="text-sm text-gray-600">{pipeline.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 className="h-4 w-4" />
            <span>{stagesCount} etapas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PipelinesDashboardProps {
  onViewPipeline?: (pipeline: Pipeline) => void;
  onEditPipeline?: (pipeline: Pipeline) => void;
  onCreatePipeline?: () => void;
}

export const PipelinesDashboard = ({ 
  onViewPipeline, 
  onEditPipeline, 
  onCreatePipeline 
}: PipelinesDashboardProps) => {
  const { pipelines, loading } = usePipelines();
  const { stages } = useStages();
  
  const getStagesCountForPipeline = (pipelineId: string) => {
    return stages.filter(stage => stage.pipeline_id === pipelineId).length;
  };

  const groupedPipelines = pipelines.reduce((acc, pipeline) => {
    if (!acc[pipeline.type]) {
      acc[pipeline.type] = [];
    }
    acc[pipeline.type].push(pipeline);
    return acc;
  }, {} as Record<PipelineType, Pipeline[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipelines</h2>
          <p className="text-gray-600">Gestiona tus procesos de negocio</p>
        </div>
        {onCreatePipeline && (
          <Button onClick={onCreatePipeline}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pipeline
          </Button>
        )}
      </div>

      {Object.entries(groupedPipelines).map(([type, pipelinesList]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {typeLabels[type as PipelineType]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelinesList.map((pipeline) => (
              <PipelineCard
                key={pipeline.id}
                pipeline={pipeline}
                stagesCount={getStagesCountForPipeline(pipeline.id)}
                onView={onViewPipeline || (() => {})}
                onSettings={onEditPipeline || (() => {})}
              />
            ))}
          </div>
        </div>
      ))}

      {pipelines.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay pipelines configurados
          </h3>
          <p className="text-gray-600 mb-4">
            Crea tu primer pipeline para empezar a gestionar tus procesos
          </p>
          {onCreatePipeline && (
            <Button onClick={onCreatePipeline}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Pipeline
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
