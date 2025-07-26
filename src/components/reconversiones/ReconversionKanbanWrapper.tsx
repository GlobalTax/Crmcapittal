import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReconversionKanban } from './ReconversionKanban';

interface ReconversionKanbanWrapperProps {
  reconversiones: any[];
  onReconversionUpdate?: () => void;
}

export function ReconversionKanbanWrapper({ reconversiones, onReconversionUpdate }: ReconversionKanbanWrapperProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ReconversionKanban 
        reconversiones={reconversiones}
        onReconversionUpdate={onReconversionUpdate}
      />
    </DndProvider>
  );
}