import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar as CalendarIcon,
  Users,
  Target,
  Star,
  Tag
} from "lucide-react";
import { AdvancedFilters } from "@/hooks/useAdvancedLeadFilters";
import { LeadStatus, LeadSource, LeadPriority, LeadQuality } from "@/types/Lead";
import { useUsers } from "@/hooks/useUsers";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

interface AdvancedFiltersPanelProps {
  filters: AdvancedFilters;
  onFilterChange: <K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filterStats: {
    total: number;
    filtered: number;
    hidden: number;
    percentage: number;
  };
}

export const AdvancedFiltersPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  filterStats
}: AdvancedFiltersPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { users } = useUsers();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onFilterChange('dateRange', {
        from: range.from.toISOString(),
        to: range.to.toISOString()
      });
    } else {
      onFilterChange('dateRange', null);
    }
  };

  const availableTags = ['urgente', 'vip', 'evento', 'referencia', 'web', 'linkedin'];

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags;
    if (currentTags.includes(tag)) {
      onFilterChange('tags', currentTags.filter(t => t !== tag));
    } else {
      onFilterChange('tags', [...currentTags, tag]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
            {hasActiveFilters && (
              <Badge variant="secondary">{filterStats.filtered} de {filterStats.total}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, empresa..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Basic Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Estado</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => onFilterChange('status', value as LeadStatus | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="NEW">Nuevo</SelectItem>
                    <SelectItem value="CONTACTED">Contactado</SelectItem>
                    <SelectItem value="QUALIFIED">Calificado</SelectItem>
                    <SelectItem value="NURTURING">Nutriendo</SelectItem>
                    <SelectItem value="CONVERTED">Convertido</SelectItem>
                    <SelectItem value="LOST">Perdido</SelectItem>
                    <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fuente</Label>
                <Select 
                  value={filters.source} 
                  onValueChange={(value) => onFilterChange('source', value as LeadSource | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="website_form">Formulario Web</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Referencia</SelectItem>
                    <SelectItem value="email_campaign">Email Campaign</SelectItem>
                    <SelectItem value="social_media">Redes Sociales</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridad</Label>
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => onFilterChange('priority', value as LeadPriority | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="LOW">Baja</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Calidad</Label>
                <Select 
                  value={filters.quality} 
                  onValueChange={(value) => onFilterChange('quality', value as LeadQuality | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="POOR">Pobre</SelectItem>
                    <SelectItem value="FAIR">Regular</SelectItem>
                    <SelectItem value="GOOD">Buena</SelectItem>
                    <SelectItem value="EXCELLENT">Excelente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Asignado a
              </Label>
              <Select 
                value={filters.assignedTo} 
                onValueChange={(value) => onFilterChange('assignedTo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Score Range */}
            <div>
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Rango de Score: {filters.scoreRange[0]} - {filters.scoreRange[1]}
              </Label>
              <div className="px-3 py-2">
                <Slider
                  value={filters.scoreRange}
                  onValueChange={(value) => onFilterChange('scoreRange', value as [number, number])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Rango de Fechas
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yyyy", { locale: es })} -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Tags Filter */}
            <div>
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Etiquetas
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Filter Stats */}
        {hasActiveFilters && (
          <div className="text-sm text-muted-foreground border-t pt-3">
            Mostrando {filterStats.filtered} de {filterStats.total} leads 
            ({filterStats.percentage}%)
            {filterStats.hidden > 0 && (
              <span className="text-orange-600 ml-2">
                • {filterStats.hidden} ocultos
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};