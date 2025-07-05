import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  CheckSquare, 
  Square, 
  Users, 
  ArrowRight, 
  AlertTriangle, 
  Trash2,
  X
} from 'lucide-react';
import { Stage } from '@/types/Pipeline';
import { useNegociosBulkOperations } from '@/hooks/useNegociosBulkOperations';
import { Negocio } from '@/types/Negocio';

interface BulkActionsBarProps {
  negocios: Negocio[];
  stages: Stage[];
  onRefresh: () => void;
  selectedIds: string[];
  onSelectItem: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  negocios,
  stages,
  onRefresh,
  selectedIds,
  onSelectItem,
  onSelectAll,
  onClearSelection
}) => {
  const {
    isProcessing,
    selectedCount,
    bulkUpdateStage,
    bulkUpdatePriority,
    bulkAssignOwner,
    bulkDelete
  } = useNegociosBulkOperations(selectedIds);

  const allSelected = negocios.length > 0 && selectedIds.length === negocios.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < negocios.length;

  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-dashed">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          Seleccionar todo
        </Button>
        <span className="text-sm text-muted-foreground">
          Selecciona negocios para realizar acciones masivas
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected || someSelected ? onClearSelection : onSelectAll}
          className="flex items-center gap-2"
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : someSelected ? (
            <div className="h-4 w-4 bg-primary/20 border-2 border-primary rounded flex items-center justify-center">
              <div className="h-2 w-2 bg-primary rounded-sm" />
            </div>
          ) : (
            <Square className="h-4 w-4" />
          )}
          {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
        </Button>

        <Badge variant="secondary" className="font-medium">
          {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Stage Update */}
        <Select onValueChange={(stageId) => bulkUpdateStage(stageId, onRefresh)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Cambiar etapa" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  {stage.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Update */}
        <Select onValueChange={(priority) => bulkUpdatePriority(priority, onRefresh)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baja">Baja</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>

        {/* Owner Assignment */}
        <Select onValueChange={(owner) => bulkAssignOwner(owner, onRefresh)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Asignar a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gerente">Gerente</SelectItem>
            <SelectItem value="Vendedor A">Vendedor A</SelectItem>
            <SelectItem value="Vendedor B">Vendedor B</SelectItem>
            <SelectItem value="Sin asignar">Sin asignar</SelectItem>
          </SelectContent>
        </Select>

        {/* Delete Action */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar negocios seleccionados?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminarán {selectedCount} negocio{selectedCount !== 1 ? 's' : ''}. 
                Esta acción se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => bulkDelete(onRefresh)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Procesando...</span>
          </div>
        </div>
      )}
    </div>
  );
};