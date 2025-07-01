
import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilter {
  field: string;
  value: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  suggestions?: string[];
  filterFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date';
    options?: string[];
  }>;
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch({
  onSearch,
  suggestions = [],
  filterFields = [],
  placeholder = "Buscar...",
  className = ""
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchFilter | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Generar sugerencias basadas en la consulta
  const filteredSuggestions = useMemo(() => {
    if (!debouncedQuery) return suggestions;
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [suggestions, debouncedQuery]);

  const handleSearch = useCallback(() => {
    onSearch(query, filters);
  }, [query, filters, onSearch]);

  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters(prev => [...prev, filter]);
    setActiveFilter(null);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setFilters([]);
    onSearch('', []);
  }, [onSearch]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-4"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          {/* Sugerencias de autocompletado */}
          {filteredSuggestions.length > 0 && query && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch();
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtros Avanzados</h4>
              
              {filterFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  
                  {field.type === 'select' && field.options ? (
                    <select
                      className="w-full p-2 border rounded-md"
                      onChange={(e) => {
                        if (e.target.value) {
                          addFilter({
                            field: field.key,
                            value: e.target.value,
                            operator: 'equals'
                          });
                        }
                      }}
                    >
                      <option value="">Seleccionar...</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      placeholder={`Buscar en ${field.label.toLowerCase()}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          addFilter({
                            field: field.key,
                            value: e.currentTarget.value,
                            operator: 'contains'
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      {/* Filtros activos */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <span className="text-xs">
                {filterFields.find(f => f.key === filter.field)?.label || filter.field}: {filter.value}
              </span>
              <button
                onClick={() => removeFilter(index)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-gray-500 hover:text-gray-700"
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Estadísticas de búsqueda */}
      {(query || filters.length > 0) && (
        <div className="text-sm text-gray-500">
          {query && <span>Buscando: "{query}"</span>}
          {filters.length > 0 && (
            <span className="ml-2">
              con {filters.length} filtro{filters.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Hook para búsqueda con historial
export const useSearchHistory = (maxItems: number = 10) => {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
};
