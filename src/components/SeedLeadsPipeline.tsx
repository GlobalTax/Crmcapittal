import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Loader2, Play, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { checkIfLeadsPipelineExists, createSampleLeadsPipeline } from '@/utils/seedLeadsPipeline';

interface SeedLeadsPipelineProps {
  onSuccess?: () => void;
  className?: string;
}

export const SeedLeadsPipeline: React.FC<SeedLeadsPipelineProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pipelineExists, setPipelineExists] = useState<boolean | null>(null);

  const checkExistingPipeline = async () => {
    setIsChecking(true);
    try {
      const exists = await checkIfLeadsPipelineExists();
      setPipelineExists(exists);
      
      if (exists) {
        toast.info('Ya existe un pipeline de leads activo');
      } else {
        toast.success('No se encontró pipeline existente, listo para crear');
      }
    } catch (error) {
      // Error checking pipeline
      toast.error('Error al verificar pipeline existente');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreatePipeline = async () => {
    setIsLoading(true);
    
    try {
      const result = await createSampleLeadsPipeline();
      
      if (result.success) {
        toast.success(result.message);
        setPipelineExists(true);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      // Error creating pipeline
      toast.error('Error inesperado al crear el pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  const stagesPreview = [
    { name: 'Nuevo', probability: '10%', color: '#94A3B8' },
    { name: 'Contactado', probability: '25%', color: '#3B82F6' },
    { name: 'Cualificado', probability: '40%', color: '#F59E0B' },
    { name: 'Propuesta', probability: '65%', color: '#8B5CF6' },
    { name: 'Negociación', probability: '80%', color: '#EF4444' },
    { name: 'Ganado', probability: '100%', color: '#10B981' },
    { name: 'Perdido', probability: '0%', color: '#6B7280' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Pipeline de Leads por Defecto
        </CardTitle>
        <CardDescription>
          Crea un pipeline estándar para gestión de leads con 7 etapas optimizadas,
          incluyendo checklists y acciones automáticas.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado del pipeline */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            {pipelineExists === null ? (
              <Circle className="h-4 w-4 text-muted-foreground" />
            ) : pipelineExists ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-orange-500" />
            )}
            <span className="text-sm font-medium">
              Estado: {
                pipelineExists === null 
                  ? 'No verificado' 
                  : pipelineExists 
                    ? 'Pipeline existente' 
                    : 'Pipeline no encontrado'
              }
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkExistingPipeline}
            disabled={isChecking}
            className="text-xs"
          >
            {isChecking ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Verificar
          </Button>
        </div>

        {/* Preview de etapas */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Etapas que se crearán:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {stagesPreview.map((stage, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-xs font-medium truncate">{stage.name}</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {stage.probability}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Características incluidas */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Incluye:
          </h4>
          <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>18 items de checklist distribuidos por etapa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>3 acciones automáticas de ejemplo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Probabilidades optimizadas por etapa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Colores y configuración completa</span>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="pt-2">
          {pipelineExists ? (
            <div className="text-center p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              ✅ Pipeline de leads ya configurado
            </div>
          ) : (
            <Button
              onClick={handleCreatePipeline}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando Pipeline...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Crear Pipeline de Leads
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};