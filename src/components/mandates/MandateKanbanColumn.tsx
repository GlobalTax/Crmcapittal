import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { MandateKanbanCard } from './MandateKanbanCard';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MandateKanbanColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
  };
  mandates: BuyingMandate[];
  onEdit: (mandate: BuyingMandate) => void;
  onView?: (mandate: BuyingMandate) => void;
  onAddMandate?: (stageId: string) => void;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

export const MandateKanbanColumn: React.FC<MandateKanbanColumnProps> = ({
  stage,
  mandates,
  onEdit,
  onView,
  onAddMandate,
  isLoading = false,
  selectedIds = [],
  onSelectItem
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col w-80 min-w-80 bg-gray-50 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-blue-50 border-2 border-blue-300' : 'border border-gray-200'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-medium text-gray-900">{stage.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {mandates.length}
          </span>
        </div>
        
        {onAddMandate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddMandate(stage.id)}
            className="h-8 w-8 p-0"
            title="Añadir mandato"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px]">
        {mandates.map((mandate) => (
          <MandateKanbanCard
            key={mandate.id}
            mandate={mandate}
            onEdit={onEdit}
            onView={onView}
            isLoading={isLoading}
            isSelected={selectedIds.includes(mandate.id)}
            onSelect={onSelectItem}
          />
        ))}
        
        {mandates.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No hay mandatos</p>
            {onAddMandate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddMandate(stage.id)}
                className="mt-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Añadir primero
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};