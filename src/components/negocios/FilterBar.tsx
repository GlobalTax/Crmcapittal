import { useState, useEffect } from 'react';
import { Search, Filter, X, Save, Bookmark, Calendar, Euro, MapPin, User, Target, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdvancedFilters, FilterState } from '@/hooks/useAdvancedFilters';
import { Negocio } from '@/types/Negocio';

interface FilterBarProps {
  negocios: Negocio[];
  onFilteredChange: (filtered: Negocio[]) => void;
}

interface SaveViewDialogProps {
  onSave: (name: string, isDefault: boolean) => void;
}

/**
 * SaveViewDialog Component
 * 
 * Dialog for saving current filter state as a named view
 */
const SaveViewDialog = ({ onSave }: SaveViewDialogProps) => {
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), isDefault);
      setName('');
      setIsDefault(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Guardar Vista
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Guardar Vista de Filtros</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="view-name">Nombre de la vista</Label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi vista personalizada"
              className="mt-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is-default" className="text-sm">
              Usar como vista por defecto
            </Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * FilterBar Component
 * 
 * Advanced filtering interface with search, multiple filter types, and saved views.
 * Provides comprehensive filtering capabilities for the Kanban board.
 * 
 * @param negocios - Array of business deals to filter
 * @param onFilteredChange - Callback when filtered results change
 */
export const FilterBar = ({ negocios, onFilteredChange }: FilterBarProps) => {
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredNegocios,
    filterOptions,
    savedViews,
    saveView,
    loadView,
    deleteView,
    hasActiveFilters,
    activeFiltersCount,
    isFiltersOpen,
    setIsFiltersOpen
  } = useAdvancedFilters(negocios);

  // Notify parent of filtered results when they change
  useEffect(() => {
    onFilteredChange(filteredNegocios);
  }, [filteredNegocios, onFilteredChange]);

  /**
   * Handles updating value range filters
   * @param type - 'min' or 'max'
   * @param value - New value
   */
  const handleValueRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : null;
    updateFilter('valueRange', {
      ...filters.valueRange,
      [type]: numValue
    });
  };

  /**
   * Handles updating date range filters
   * @param type - 'start' or 'end'
   * @param value - New date value
   */
  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    updateFilter('dateRange', {
      ...filters.dateRange,
      [type]: value
    });
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4">
      {/* Filter Toggle Button and Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant={isFiltersOpen ? "default" : "outline"}
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isFiltersOpen && (
        <div className="border-t border-border pt-4 space-y-4">
          {/* Saved Views */}
          {savedViews.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Vistas Guardadas</Label>
              <div className="flex flex-wrap gap-2">
                {savedViews.map((view) => (
                  <div key={view.id} className="flex items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadView(view.id)}
                      className="mr-1"
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      {view.name}
                      {view.isDefault && <Badge variant="secondary" className="ml-1 text-xs">Default</Badge>}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteView(view.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Owner Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <User className="h-3 w-3 mr-1" />
                Propietario
              </Label>
              <Select value={filters.owner} onValueChange={(value) => updateFilter('owner', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los propietarios" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-50">
                  <SelectItem value="all">Todos los propietarios</SelectItem>
                  {filterOptions.owners.map((owner) => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Target className="h-3 w-3 mr-1" />
                Prioridad
              </Label>
              <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-50">
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  {filterOptions.priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Building className="h-3 w-3 mr-1" />
                Sector
              </Label>
              <Select value={filters.sector} onValueChange={(value) => updateFilter('sector', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los sectores" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-50">
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {filterOptions.sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                Ubicación
              </Label>
              <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ubicaciones" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-50">
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {filterOptions.locations.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Ranges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Value Range */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Euro className="h-3 w-3 mr-1" />
                Rango de Valor
              </Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.valueRange.min || ''}
                  onChange={(e) => handleValueRangeChange('min', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={filters.valueRange.max || ''}
                  onChange={(e) => handleValueRangeChange('max', e.target.value)}
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Rango de Fechas
              </Label>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                />
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Save View Action */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {filteredNegocios.length} de {negocios.length} negocios
            </div>
            <SaveViewDialog onSave={saveView} />
          </div>
        </div>
      )}
    </div>
  );
};