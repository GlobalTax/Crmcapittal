
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { OperacionCard } from "./OperacionCard";

// Mock data siguiendo tu guía
const mockStages = [
  { id: 'nda', name: 'NDA Firmado', count: 2 },
  { id: 'loi', name: 'LOI Recibida', count: 4 },
  { id: 'dd', name: 'Due Diligence', count: 1 },
  { id: 'spa', name: 'Negociación SPA', count: 3 }
];

const mockOperaciones = {
  'nda': [
    { id: '1', name: 'Adquisición de Innovatech', value: '5.2M €', score: 92, sector: 'Tecnología' },
    { id: '2', name: 'Compra de LogisCorp', value: '3.8M €', score: 85, sector: 'Logística' }
  ],
  'loi': [
    { id: '3', name: 'Fusión con Soluciones Globales', value: '12M €', score: 75, sector: 'Consultoría' },
    { id: '4', name: 'Adquisición de TechStart', value: '8.5M €', score: 88, sector: 'Startup Tech' },
    { id: '5', name: 'Compra de EcoSolutions', value: '6.2M €', score: 91, sector: 'Sostenibilidad' },
    { id: '6', name: 'Inversión en DataAnalytics', value: '4.1M €', score: 78, sector: 'Big Data' }
  ],
  'dd': [
    { id: '7', name: 'Adquisición de MedTech Pro', value: '15.3M €', score: 94, sector: 'HealthTech' }
  ],
  'spa': [
    { id: '8', name: 'Fusión con IndustrialCorp', value: '22M €', score: 82, sector: 'Industrial' },
    { id: '9', name: 'Compra de FinanceHub', value: '18.7M €', score: 89, sector: 'Fintech' },
    { id: '10', name: 'Inversión en GreenEnergy', value: '11.5M €', score: 86, sector: 'Energía' }
  ]
};

export const OperacionesKanban = () => {
  const [operaciones, setOperaciones] = useState(mockOperaciones);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    setDraggedCard(null);
    
    if (!result.destination) return;

    const sourceStageId = result.source.droppableId;
    const destinationStageId = result.destination.droppableId;
    
    if (sourceStageId === destinationStageId) return;

    // Simular el movimiento de tarjetas entre columnas
    const sourceItems = [...operaciones[sourceStageId as keyof typeof operaciones]];
    const destItems = [...operaciones[destinationStageId as keyof typeof operaciones]];
    const [movedItem] = sourceItems.splice(result.source.index, 1);
    destItems.splice(result.destination.index, 0, movedItem);

    setOperaciones({
      ...operaciones,
      [sourceStageId]: sourceItems,
      [destinationStageId]: destItems
    });
  };

  const handleDragStart = (start: any) => {
    setDraggedCard(start.draggableId);
  };

  return (
    <div className="w-full">
      {/* Contenedor del Kanban con scroll horizontal */}
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {mockStages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              {/* Columna con estilo específico */}
              <div className="bg-slate-100 rounded-lg p-3 min-h-[600px]">
                {/* Cabecera de la Columna */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-900">{stage.name}</h4>
                  <div className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-sm font-medium">
                    {operaciones[stage.id as keyof typeof operaciones]?.length || 0}
                  </div>
                </div>

                {/* Área de Drop */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[500px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 bg-opacity-50 rounded-lg' : ''
                      }`}
                    >
                      {(operaciones[stage.id as keyof typeof operaciones] || []).map((operacion, index) => (
                        <Draggable
                          key={operacion.id}
                          draggableId={operacion.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-transform ${
                                snapshot.isDragging ? 'rotate-3 scale-105' : ''
                              } ${
                                draggedCard === operacion.id ? 'opacity-50' : ''
                              }`}
                            >
                              <OperacionCard operacion={operacion} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Estado vacío */}
                      {(!operaciones[stage.id as keyof typeof operaciones] || operaciones[stage.id as keyof typeof operaciones].length === 0) && (
                        <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                          No hay operaciones en esta etapa
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
