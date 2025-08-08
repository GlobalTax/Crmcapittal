import React from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ReconversionKanban } from './ReconversionKanban';
import { useReconversionWorkflow } from '@/hooks/useReconversionWorkflow';

interface ReconversionKanbanWrapperProps {
  reconversiones: any[];
  onReconversionUpdate?: () => void;
}

export function ReconversionKanbanWrapper({ reconversiones, onReconversionUpdate }: ReconversionKanbanWrapperProps) {
  const { updateSubfase } = useReconversionWorkflow();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reconversionId = active.id as string;
    const newSubfase = over.id as string;
    
    // Find the current reconversion
    const reconversion = reconversiones.find(r => r.id === reconversionId);
    if (!reconversion || reconversion.subfase === newSubfase) return;

    try {
      const success = await updateSubfase(reconversionId, newSubfase);
      if (success && onReconversionUpdate) {
        onReconversionUpdate();
      }
    } catch (error) {
      console.error('Error updating subfase:', error);
    }
  };

  const reconversionIds = reconversiones.map(r => r.id);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={reconversionIds} strategy={verticalListSortingStrategy}>
        <ReconversionKanban 
          reconversiones={reconversiones}
          onReconversionUpdate={onReconversionUpdate}
        />
      </SortableContext>
    </DndContext>
  );
}