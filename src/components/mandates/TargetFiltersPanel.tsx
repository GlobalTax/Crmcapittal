import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';

interface TargetFiltersProps {
  targets: MandateTarget[];
  onFilter: (filteredTargets: MandateTarget[]) => void;
}

interface FilterState {
  search: string;
  status: string;
  sector: string;
  minRevenues: string;
  maxRevenues: string;
  contacted: string;
  hasContact: string;
}

export const TargetFiltersPanel = ({ targets, onFilter }: TargetFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    sector: '',
    minRevenues: '',
    maxRevenues: '',
    contacted: '',
    hasContact: '',
  });

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'contacted', label: 'Contactado' },
    { value: 'in_analysis', label: 'En Análisis' },
    { value: 'interested', label: 'Interesado' },
    { value: 'nda_signed', label: 'NDA Firmado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'closed', label: 'Cerrado' },
  ];

  const applyFilters = () => {
    let filtered = [...targets];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(target =>
        target.company_name.toLowerCase().includes(searchLower) ||
        target.sector?.toLowerCase().includes(searchLower) ||
        target.contact_name?.toLowerCase().includes(searchLower) ||
        target.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(target => target.status === filters.status);
    }

    // Sector filter
    if (filters.sector) {
      filtered = filtered.filter(target => 
        target.sector?.toLowerCase().includes(filters.sector.toLowerCase())
      );
    }

    // Revenue filters
    if (filters.minRevenues) {
      const minRev = Number(filters.minRevenues);
      filtered = filtered.filter(target => target.revenues && target.revenues >= minRev);
    }
    if (filters.maxRevenues) {
      const maxRev = Number(filters.maxRevenues);
      filtered = filtered.filter(target => target.revenues && target.revenues <= maxRev);
    }

    // Contacted filter
    if (filters.contacted === 'true') {
      filtered = filtered.filter(target => target.contacted);
    } else if (filters.contacted === 'false') {
      filtered = filtered.filter(target => !target.contacted);
    }

    // Has contact filter
    if (filters.hasContact === 'true') {
      filtered = filtered.filter(target => target.contact_name && target.contact_email);
    } else if (filters.hasContact === 'false') {
      filtered = filtered.filter(target => !target.contact_name || !target.contact_email);
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      sector: '',
      minRevenues: '',
      maxRevenues: '',
      contacted: '',
      hasContact: '',
    });
    onFilter(targets);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-apply search filter
    if (key === 'search') {
      let filtered = [...targets];
      if (value) {
        const searchLower = value.toLowerCase();
        filtered = filtered.filter(target =>
          target.company_name.toLowerCase().includes(searchLower) ||
          target.sector?.toLowerCase().includes(searchLower) ||
          target.contact_name?.toLowerCase().includes(searchLower) ||
          target.notes?.toLowerCase().includes(searchLower)
        );
      }
      onFilter(filtered);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4" />
                Filtros y Búsqueda
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              <ChevronDown className="h-4 w-4 transition-transform" />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, sector, contacto o notas..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Status and basic filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Estado</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los estados</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Contactado</Label>
                  <Select value={filters.contacted} onValueChange={(value) => updateFilter('contacted', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="true">Contactados</SelectItem>
                      <SelectItem value="false">Sin contactar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Tiene Contacto</Label>
                  <Select value={filters.hasContact} onValueChange={(value) => updateFilter('hasContact', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="true">Con contacto</SelectItem>
                      <SelectItem value="false">Sin contacto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Sector</Label>
                  <Input
                    placeholder="Ej: Tecnología"
                    value={filters.sector}
                    onChange={(e) => updateFilter('sector', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Revenue range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Facturación mínima (€)</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={filters.minRevenues}
                    onChange={(e) => updateFilter('minRevenues', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Facturación máxima (€)</Label>
                  <Input
                    type="number"
                    placeholder="10000000"
                    value={filters.maxRevenues}
                    onChange={(e) => updateFilter('maxRevenues', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar Filtros
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};