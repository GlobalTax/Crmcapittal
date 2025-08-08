
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

// Draggable Operation Card Component
const DraggableOperacionCard = ({ operacion, index }: { operacion: any; index: number }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: operacion.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`transition-transform ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <OperacionCard operacion={operacion} />
    </div>
  );
};

// Droppable Column Component
const DroppableColumn = ({ stage, operaciones }: { stage: any; operaciones: any[] }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const operacionIds = operaciones.map(op => op.id);

  return (
    <div key={stage.id} className="flex-shrink-0 w-80">
      {/* Columna con estilo específico */}
      <div className="bg-slate-100 rounded-lg p-3 min-h-[600px]">
        {/* Cabecera de la Columna */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-slate-900">{stage.name}</h4>
          <div className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-sm font-medium">
            {operaciones?.length || 0}
          </div>
        </div>

        {/* Área de Drop */}
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-[500px] transition-colors ${
            isOver ? 'bg-blue-50 bg-opacity-50 rounded-lg' : ''
          }`}
        >
          <SortableContext items={operacionIds} strategy={verticalListSortingStrategy}>
            {(operaciones || []).map((operacion, index) => (
              <DraggableOperacionCard
                key={operacion.id}
                operacion={operacion}
                index={index}
              />
            ))}
          </SortableContext>
          
          {/* Estado vacío */}
          {(!operaciones || operaciones.length === 0) && (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              No hay operaciones en esta etapa
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const OperacionesKanban = () => {
  const [operaciones, setOperaciones] = useState(mockOperaciones);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedCard(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedCard(null);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination stages
    let sourceStageId = '';
    let destinationStageId = overId;

    // Find which stage contains the dragged item
    for (const [stageId, items] of Object.entries(operaciones)) {
      if (items.some((item: any) => item.id === activeId)) {
        sourceStageId = stageId;
        break;
      }
    }

    if (sourceStageId === destinationStageId) return;

    // Move item between stages
    const sourceItems = [...operaciones[sourceStageId as keyof typeof operaciones]];
    const destItems = [...operaciones[destinationStageId as keyof typeof operaciones]];
    
    const movedItemIndex = sourceItems.findIndex((item: any) => item.id === activeId);
    if (movedItemIndex === -1) return;

    const [movedItem] = sourceItems.splice(movedItemIndex, 1);
    destItems.push(movedItem);

    setOperaciones({
      ...operaciones,
      [sourceStageId]: sourceItems,
      [destinationStageId]: destItems
    });
  };

  return (
    <div className="w-full">
      {/* Contenedor del Kanban con scroll horizontal */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {mockStages.map((stage) => (
            <DroppableColumn 
              key={stage.id}
              stage={stage}
              operaciones={operaciones[stage.id as keyof typeof operaciones] || []}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};
