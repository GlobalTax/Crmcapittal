import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";

interface Column {
  id: string;
  label: string;
  visible: boolean;
  type?: 'text' | 'email' | 'phone' | 'select' | 'date' | 'badge';
  options?: string[];
}

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic?: 'AND' | 'OR';
}

interface AdvancedFiltersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  columns: Column[];
}

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contiene' },
    { value: 'equals', label: 'Es igual a' },
    { value: 'starts_with', label: 'Empieza con' },
    { value: 'ends_with', label: 'Termina con' },
    { value: 'not_contains', label: 'No contiene' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' }
  ],
  select: [
    { value: 'equals', label: 'Es igual a' },
    { value: 'not_equals', label: 'No es igual a' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' }
  ],
  date: [
    { value: 'equals', label: 'Es igual a' },
    { value: 'before', label: 'Es anterior a' },
    { value: 'after', label: 'Es posterior a' },
    { value: 'between', label: 'Está entre' },
    { value: 'last_days', label: 'Últimos X días' },
    { value: 'is_empty', label: 'Está vacío' },
    { value: 'is_not_empty', label: 'No está vacío' }
  ]
};

export function AdvancedFiltersPanel({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  columns
}: AdvancedFiltersPanelProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);

  const addCondition = () => {
    const newCondition: FilterCondition = {
      id: `condition_${Date.now()}`,
      field: '',
      operator: '',
      value: '',
      logic: 'AND'
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(prev =>
      prev.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
  };

  const removeCondition = (id: string) => {
    setConditions(prev => prev.filter(condition => condition.id !== id));
  };

  const applyFilters = () => {
    const newFilters: Record<string, any> = {};
    
    conditions.forEach(condition => {
      if (condition.field && condition.operator && condition.value) {
        // Convert condition to simple filter format for now
        // In a real implementation, you'd want to store the complex conditions
        newFilters[condition.field] = condition.value;
      }
    });

    onFiltersChange(newFilters);
    onOpenChange(false);
  };

  const clearAllFilters = () => {
    setConditions([]);
    onFiltersChange({});
  };

  const getOperatorsForField = (fieldId: string) => {
    const column = columns.find(col => col.id === fieldId);
    if (!column) return OPERATORS.text;
    
    switch (column.type) {
      case 'select':
        return OPERATORS.select;
      case 'date':
        return OPERATORS.date;
      default:
        return OPERATORS.text;
    }
  };

  const getFieldOptions = (fieldId: string) => {
    const column = columns.find(col => col.id === fieldId);
    return column?.options || [];
  };

  const renderValueInput = (condition: FilterCondition) => {
    const column = columns.find(col => col.id === condition.field);
    
    if (!column || !condition.operator) return null;

    if (['is_empty', 'is_not_empty'].includes(condition.operator)) {
      return null; // No value needed for these operators
    }

    if (column.type === 'select' && column.options) {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) => updateCondition(condition.id, { value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar valor" />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (column.type === 'date') {
      return (
        <Input
          type="date"
          value={condition.value}
          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
        />
      );
    }

    return (
      <Input
        type="text"
        placeholder="Introducir valor"
        value={condition.value}
        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
      />
    );
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filtros avanzados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Crea filtros complejos para encontrar exactamente los contactos que necesitas
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Filter Conditions */}
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-3">
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={condition.logic}
                      onValueChange={(value: 'AND' | 'OR') =>
                        updateCondition(condition.id, { logic: value })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">Y</SelectItem>
                        <SelectItem value="OR">O</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-12 gap-2 items-end">
                  {/* Field */}
                  <div className="col-span-4">
                    <Label className="text-xs">Campo</Label>
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        updateCondition(condition.id, { field: value, operator: '', value: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns
                          .filter(col => col.id !== 'actions')
                          .map((column) => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator */}
                  <div className="col-span-3">
                    <Label className="text-xs">Operador</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateCondition(condition.id, { operator: value, value: '' })
                      }
                      disabled={!condition.field}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operador" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorsForField(condition.field).map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value */}
                  <div className="col-span-4">
                    <Label className="text-xs">Valor</Label>
                    {renderValueInput(condition)}
                  </div>

                  {/* Remove button */}
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add condition button */}
          <Button
            variant="outline"
            onClick={addCondition}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir condición
          </Button>

          {/* Quick filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filtros rápidos</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFiltersChange({ contact_type: 'lead' });
                  onOpenChange(false);
                }}
              >
                Solo Leads
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFiltersChange({ contact_priority: 'high' });
                  onOpenChange(false);
                }}
              >
                Alta prioridad
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onFiltersChange({ contact_type: 'customer' });
                  onOpenChange(false);
                }}
              >
                Solo clientes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  onFiltersChange({ created_at: lastWeek.toISOString() });
                  onOpenChange(false);
                }}
              >
                Últimos 7 días
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyFilters} className="flex-1">
              Aplicar filtros
            </Button>
            <Button variant="outline" onClick={clearAllFilters}>
              Limpiar todo
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}