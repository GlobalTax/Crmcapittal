import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, GripVertical, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Column {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
  sortable?: boolean;
  editable?: boolean;
  type?: 'text' | 'email' | 'phone' | 'select' | 'date' | 'badge';
  options?: string[];
}

interface ColumnEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

// Available properties that can be added as columns
const AVAILABLE_PROPERTIES: Column[] = [
  { id: 'name', label: 'Nombre', visible: false, sortable: true, editable: true, type: 'text' },
  { id: 'email', label: 'Email', visible: false, sortable: true, editable: true, type: 'email' },
  { id: 'phone', label: 'Teléfono', visible: false, editable: true, type: 'phone' },
  { id: 'company', label: 'Empresa', visible: false, sortable: true, editable: true, type: 'text' },
  { id: 'position', label: 'Cargo', visible: false, editable: true, type: 'text' },
  { id: 'contact_type', label: 'Tipo de contacto', visible: false, editable: true, type: 'select', 
    options: ['lead', 'prospect', 'customer', 'partner', 'other'] },
  { id: 'contact_priority', label: 'Prioridad', visible: false, editable: true, type: 'select',
    options: ['low', 'medium', 'high'] },
  { id: 'contact_source', label: 'Fuente', visible: false, editable: true, type: 'text' },
  { id: 'language_preference', label: 'Idioma preferido', visible: false, editable: true, type: 'select',
    options: ['es', 'en', 'fr', 'de'] },
  { id: 'preferred_contact_method', label: 'Método de contacto preferido', visible: false, editable: true, type: 'select',
    options: ['email', 'phone', 'whatsapp', 'linkedin'] },
  { id: 'website_url', label: 'Sitio web', visible: false, editable: true, type: 'text' },
  { id: 'linkedin_url', label: 'LinkedIn', visible: false, editable: true, type: 'text' },
  { id: 'notes', label: 'Notas', visible: false, editable: true, type: 'text' },
  { id: 'investment_capacity_min', label: 'Capacidad inversión (mín)', visible: false, editable: true, type: 'text' },
  { id: 'investment_capacity_max', label: 'Capacidad inversión (máx)', visible: false, editable: true, type: 'text' },
  { id: 'sectors_of_interest', label: 'Sectores de interés', visible: false, editable: true, type: 'text' },
  { id: 'time_zone', label: 'Zona horaria', visible: false, editable: true, type: 'text' },
  { id: 'created_at', label: 'Fecha de creación', visible: false, sortable: true, type: 'date' },
  { id: 'updated_at', label: 'Última actualización', visible: false, sortable: true, type: 'date' },
  { id: 'last_interaction_date', label: 'Última interacción', visible: false, sortable: true, type: 'date' },
  { id: 'actions', label: 'Acciones', visible: false, sortable: false }
];

export function ColumnEditorModal({ open, onOpenChange, columns, onColumnsChange }: ColumnEditorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [workingColumns, setWorkingColumns] = useState<Column[]>(columns);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(workingColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWorkingColumns(items);
  };

  const toggleColumnVisibility = (columnId: string) => {
    setWorkingColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const addColumn = (property: Column) => {
    const newColumn = { ...property, visible: true };
    const existingIndex = workingColumns.findIndex(col => col.id === property.id);
    
    if (existingIndex >= 0) {
      // Column exists, just make it visible
      setWorkingColumns(prev =>
        prev.map(col =>
          col.id === property.id ? { ...col, visible: true } : col
        )
      );
    } else {
      // Add new column
      setWorkingColumns(prev => [...prev, newColumn]);
    }
  };

  const removeColumn = (columnId: string) => {
    setWorkingColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: false } : col
      )
    );
  };

  const handleSave = () => {
    onColumnsChange(workingColumns);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setWorkingColumns(columns);
    onOpenChange(false);
  };

  const visibleColumns = workingColumns.filter(col => col.visible);
  const availableToAdd = AVAILABLE_PROPERTIES.filter(prop => 
    !visibleColumns.some(col => col.id === prop.id) &&
    prop.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Editar columnas</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-96">
          {/* Left Panel - Available Properties */}
          <div className="border-r pr-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Propiedades disponibles
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar propiedades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {availableToAdd.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer"
                    onClick={() => addColumn(property)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{property.label}</span>
                      {property.editable && (
                        <Badge variant="outline" className="text-xs">Editable</Badge>
                      )}
                      {property.sortable && (
                        <Badge variant="outline" className="text-xs">Ordenable</Badge>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Selected Columns */}
          <div className="pl-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Columnas seleccionadas ({visibleColumns.length})
                </h3>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-1 max-h-64 overflow-y-auto"
                    >
                      {visibleColumns.map((column, index) => (
                        <Draggable key={column.id} draggableId={column.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center justify-between p-2 rounded border bg-background ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                </div>
                                <span className="text-sm">{column.label}</span>
                                {column.editable && (
                                  <Badge variant="outline" className="text-xs">Editable</Badge>
                                )}
                                {column.sortable && (
                                  <Badge variant="outline" className="text-xs">Ordenable</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleColumnVisibility(column.id)}
                                >
                                  {column.visible ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeColumn(column.id)}
                                >
                                  <ArrowLeft className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}