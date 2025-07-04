import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Euro, Calendar, Users, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { Negocio } from '@/types/Negocio';
import { useStages } from '@/hooks/useStages';
import { usePipelines } from '@/hooks/usePipelines';

interface NegociosKanbanProps {
  negocios: Negocio[];
  onUpdateStage: (negocioId: string, stageId: string) => Promise<any>;
  onEdit: (negocio: Negocio) => void;
}

export const NegociosKanban = ({ negocios, onUpdateStage, onEdit }: NegociosKanbanProps) => {
  const { stages } = useStages('DEAL');
  const { pipelines } = usePipelines();
  const [isDragging, setIsDragging] = useState(false);

  // Get DEAL pipeline stages
  const dealPipeline = pipelines.find(p => p.type === 'DEAL');
  const dealStages = stages
    .filter(s => s.pipeline_id === dealPipeline?.id)
    .sort((a, b) => a.order_index - b.order_index);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStageId = destination.droppableId;
    
    try {
      await onUpdateStage(draggableId, newStageId);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const getNegociosByStage = (stageId: string) => {
    return negocios.filter(negocio => negocio.stage_id === stageId);
  };

  const getTotalValueByStage = (stageId: string) => {
    const stageNegocios = getNegociosByStage(stageId);
    return stageNegocios.reduce((total, negocio) => total + (negocio.valor_negocio || 0), 0);
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baja': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (dealStages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay etapas configuradas para el pipeline de negocios.</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {dealStages.map((stage) => {
            const stageNegocios = getNegociosByStage(stage.id);
            const totalValue = getTotalValueByStage(stage.id);

            return (
              <div key={stage.id} className="min-w-[350px] flex-shrink-0">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 
                      className="font-semibold text-lg flex items-center gap-2"
                      style={{ color: stage.color }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                    </h3>
                    <Badge variant="secondary">{stageNegocios.length}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: {new Intl.NumberFormat('es-ES', { 
                      style: 'currency', 
                      currency: 'EUR',
                      minimumFractionDigits: 0 
                    }).format(totalValue)}
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-3 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-muted/50' : ''
                      }`}
                    >
                      {stageNegocios.map((negocio, index) => (
                        <Draggable key={negocio.id} draggableId={negocio.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                              onClick={() => onEdit(negocio)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-base line-clamp-2">
                                    {negocio.nombre_negocio}
                                  </CardTitle>
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-2 ${getPriorityColor(negocio.prioridad)}`}
                                  >
                                    {negocio.prioridad}
                                  </Badge>
                                </div>
                                {negocio.company && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building2 className="h-4 w-4" />
                                    <span className="truncate">{negocio.company.name}</span>
                                  </div>
                                )}
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-2">
                                  {negocio.valor_negocio && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Euro className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-green-600">
                                        {new Intl.NumberFormat('es-ES', { 
                                          style: 'currency', 
                                          currency: 'EUR',
                                          minimumFractionDigits: 0 
                                        }).format(negocio.valor_negocio)}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {negocio.contact && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Users className="h-4 w-4" />
                                      <span className="truncate">{negocio.contact.name}</span>
                                    </div>
                                  )}

                                  {negocio.ubicacion && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <MapPin className="h-4 w-4" />
                                      <span className="truncate">{negocio.ubicacion}</span>
                                    </div>
                                  )}

                                  {negocio.fecha_cierre && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {new Date(negocio.fecha_cierre).toLocaleDateString('es-ES')}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {negocio.tipo_negocio}
                                    </Badge>
                                    
                                    {negocio.propietario_negocio && (
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {negocio.propietario_negocio.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};