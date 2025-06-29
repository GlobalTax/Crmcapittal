
import { usePipelines } from "@/hooks/usePipelines";
import { useStages } from "@/hooks/useStages";
import { Pipeline } from "@/types/Pipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Target, Users, Briefcase, HandCoins, Eye, Edit, Plus } from "lucide-react";

interface PipelinesDashboardProps {
  onViewPipeline: (pipeline: Pipeline) => void;
  onEditPipeline: (pipeline: Pipeline) => void;
  onCreatePipeline: () => void;
}

export const PipelinesDashboard = ({
  onViewPipeline,
  onEditPipeline,
  onCreatePipeline
}: PipelinesDashboardProps) => {
  const { pipelines, loading } = usePipelines();
  const { stages } = useStages();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OPERACION': return Building2;
      case 'TARGET_COMPANY': return Target;
      case 'LEAD': return Users;
      case 'PROYECTO': return Briefcase;
      case 'DEAL': return HandCoins;
      default: return Building2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'OPERACION': return 'bg-blue-100 text-blue-800';
      case 'TARGET_COMPANY': return 'bg-green-100 text-green-800';
      case 'LEAD': return 'bg-purple-100 text-purple-800';
      case 'PROYECTO': return 'bg-yellow-100 text-yellow-800';
      case 'DEAL': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'OPERACION': return 'Operaciones';
      case 'TARGET_COMPANY': return 'Empresas Objetivo';
      case 'LEAD': return 'Leads';
      case 'PROYECTO': return 'Proyectos';
      case 'DEAL': return 'Deals M&A';
      default: return type;
    }
  };

  const getPipelineStageCount = (pipelineId: string) => {
    return stages.filter(stage => stage.pipeline_id === pipelineId).length;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pipelines</h1>
          <p className="text-gray-600">Administra todos los pipelines de tu organización</p>
        </div>
        <Button onClick={onCreatePipeline} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Crear Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pipelines.map((pipeline) => {
          const Icon = getTypeIcon(pipeline.type);
          const stageCount = getPipelineStageCount(pipeline.id);
          
          return (
            <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {pipeline.name}
                      </CardTitle>
                      <Badge className={`mt-1 ${getTypeColor(pipeline.type)}`}>
                        {getTypeLabel(pipeline.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {pipeline.description && (
                  <p className="text-sm text-gray-600">{pipeline.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{stageCount} etapas</span>
                  <span>
                    Creado: {new Date(pipeline.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => onViewPipeline(pipeline)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Pipeline
                  </Button>
                  <Button
                    onClick={() => onEditPipeline(pipeline)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pipelines.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay pipelines configurados
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer pipeline para comenzar a gestionar tus procesos
          </p>
          <Button onClick={onCreatePipeline} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Crear Pipeline
          </Button>
        </div>
      )}
    </div>
  );
};
