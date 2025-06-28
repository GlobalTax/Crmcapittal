
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Users,
  Building,
  Target,
  Sliders
} from 'lucide-react';
import { CONTACT_TYPES, CONTACT_PRIORITIES } from '@/types/Contact';

interface AdvancedContactFiltersProps {
  onFiltersChange: (filters: any) => void;
  totalResults: number;
}

export const AdvancedContactFilters = ({ onFiltersChange, totalResults }: AdvancedContactFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    contactTypes: [] as string[],
    priorities: [] as string[],
    sectors: [] as string[],
    sources: [] as string[],
    hasRecentInteraction: false,
    hasUpcomingReminders: false,
    investmentRange: { min: '', max: '' },
    lastInteractionDays: '',
    isActive: null as boolean | null,
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Contar filtros activos
    let count = 0;
    if (newFilters.search) count++;
    if (newFilters.contactTypes.length > 0) count++;
    if (newFilters.priorities.length > 0) count++;
    if (newFilters.sectors.length > 0) count++;
    if (newFilters.sources.length > 0) count++;
    if (newFilters.hasRecentInteraction) count++;
    if (newFilters.hasUpcomingReminders) count++;
    if (newFilters.investmentRange.min || newFilters.investmentRange.max) count++;
    if (newFilters.lastInteractionDays) count++;
    if (newFilters.isActive !== null) count++;
    
    setActiveFiltersCount(count);
  };

  const toggleFilter = (category: string, value: string) => {
    const currentArray = filters[category as keyof typeof filters] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ ...filters, [category]: newArray });
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      search: '',
      contactTypes: [],
      priorities: [],
      sectors: [],
      sources: [],
      hasRecentInteraction: false,
      hasUpcomingReminders: false,
      investmentRange: { min: '', max: '' },
      lastInteractionDays: '',
      isActive: null,
    };
    updateFilters(emptyFilters);
  };

  const commonSectors = [
    'Tecnología', 'Finanzas', 'Salud', 'Educación', 'Retail',
    'Manufacturación', 'Energía', 'Inmobiliario', 'Alimentación'
  ];

  const commonSources = [
    'LinkedIn', 'Referido', 'Evento', 'Web', 'Cold Call', 
    'Email Campaign', 'Partner', 'Networking'
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros Avanzados</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {totalResults} resultados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Sliders className="h-4 w-4 mr-2" />
              {isExpanded ? 'Contraer' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Búsqueda principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, email, empresa, sector..."
            value={filters.search}
            onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.hasRecentInteraction ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ 
              ...filters, 
              hasRecentInteraction: !filters.hasRecentInteraction 
            })}
          >
            Interacción Reciente
          </Button>
          <Button
            variant={filters.hasUpcomingReminders ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ 
              ...filters, 
              hasUpcomingReminders: !filters.hasUpcomingReminders 
            })}
          >
            Con Recordatorios
          </Button>
          <Button
            variant={filters.isActive === true ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ 
              ...filters, 
              isActive: filters.isActive === true ? null : true 
            })}
          >
            Solo Activos
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Tipos de contacto */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Tipo de Contacto
              </h4>
              <div className="flex flex-wrap gap-2">
                {CONTACT_TYPES.map(type => (
                  <Button
                    key={type.value}
                    variant={filters.contactTypes.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter('contactTypes', type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Prioridades */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Prioridad
              </h4>
              <div className="flex flex-wrap gap-2">
                {CONTACT_PRIORITIES.map(priority => (
                  <Button
                    key={priority.value}
                    variant={filters.priorities.includes(priority.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter('priorities', priority.value)}
                  >
                    {priority.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sectores */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Sector
              </h4>
              <div className="flex flex-wrap gap-2">
                {commonSectors.map(sector => (
                  <Button
                    key={sector}
                    variant={filters.sectors.includes(sector) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter('sectors', sector)}
                  >
                    {sector}
                  </Button>
                ))}
              </div>
            </div>

            {/* Fuentes */}
            <div>
              <h4 className="text-sm font-medium mb-2">Fuente de Contacto</h4>
              <div className="flex flex-wrap gap-2">
                {commonSources.map(source => (
                  <Button
                    key={source}
                    variant={filters.sources.includes(source) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter('sources', source)}
                  >
                    {source}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rango de inversión */}
            <div>
              <h4 className="text-sm font-medium mb-2">Capacidad de Inversión (€)</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Mínimo"
                  type="number"
                  value={filters.investmentRange.min}
                  onChange={(e) => updateFilters({
                    ...filters,
                    investmentRange: { ...filters.investmentRange, min: e.target.value }
                  })}
                />
                <Input
                  placeholder="Máximo"
                  type="number"
                  value={filters.investmentRange.max}
                  onChange={(e) => updateFilters({
                    ...filters,
                    investmentRange: { ...filters.investmentRange, max: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Última interacción */}    
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Última Interacción
              </h4>
              <Input
                placeholder="Días desde última interacción"
                type="number"
                value={filters.lastInteractionDays}
                onChange={(e) => updateFilters({
                  ...filters,
                  lastInteractionDays: e.target.value
                })}
              />
            </div>
          </div>
        )}

        {/* Botón limpiar filtros */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros ({activeFiltersCount})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
