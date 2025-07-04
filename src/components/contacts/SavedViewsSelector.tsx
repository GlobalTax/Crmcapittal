import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Star, Plus, Edit, Trash2 } from "lucide-react";

interface ContactView {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  columns: any[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  is_default: boolean;
}

interface SavedViewsSelectorProps {
  savedViews: ContactView[];
  currentView: ContactView | null;
  onViewChange: (view: ContactView | null) => void;
  onCreateView: () => void;
  onEditView?: (view: ContactView) => void;
  onDeleteView?: (viewId: string) => void;
}

export function SavedViewsSelector({
  savedViews,
  currentView,
  onViewChange,
  onCreateView,
  onEditView,
  onDeleteView
}: SavedViewsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewSelect = (view: ContactView | null) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const activeFiltersCount = currentView ? Object.values(currentView.filters).filter(Boolean).length : 0;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between min-w-[200px]">
            <div className="flex items-center gap-2">
              <span>{currentView?.name || 'Todos los contactos'}</span>
              {currentView?.is_default && (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64">
          {/* Default view */}
          <DropdownMenuItem onClick={() => handleViewSelect(null)}>
            <div className="flex items-center justify-between w-full">
              <span>Todos los contactos</span>
              {!currentView && <Badge variant="outline" className="text-xs">Actual</Badge>}
            </div>
          </DropdownMenuItem>
          
          {savedViews.length > 0 && <DropdownMenuSeparator />}
          
          {/* Saved views */}
          {savedViews.map((view) => (
            <DropdownMenuItem
              key={view.id}
              className="flex items-center justify-between"
              onClick={() => handleViewSelect(view)}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="truncate">{view.name}</span>
                {view.is_default && (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                )}
                {currentView?.id === view.id && (
                  <Badge variant="outline" className="text-xs">Actual</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                {onEditView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditView(view);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {onDeleteView && !view.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteView(view.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {/* Create new view */}
          <DropdownMenuItem onClick={onCreateView}>
            <Plus className="h-4 w-4 mr-2" />
            Crear nueva vista
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Active filters indicator */}
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}