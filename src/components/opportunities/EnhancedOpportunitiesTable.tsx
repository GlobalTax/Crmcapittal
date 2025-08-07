import React, { useState, useMemo, useCallback } from 'react';
import { OpportunityWithContacts } from '@/types/Opportunity';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Search,
  Filter,
  Calendar,
  Euro,
  Target,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface EnhancedOpportunitiesTableProps {
  opportunities: OpportunityWithContacts[];
  loading: boolean;
}

type SortField = 'title' | 'value' | 'stage' | 'created_at' | 'company' | 'probability';
type SortDirection = 'asc' | 'desc';

// Memoized constants
const STAGES = useMemo(() => [
  { value: 'prospecting', label: 'Prospección', color: 'bg-blue-100 text-blue-800' },
  { value: 'qualification', label: 'Cualificación', color: 'bg-purple-100 text-purple-800' },
  { value: 'proposal', label: 'Propuesta', color: 'bg-orange-100 text-orange-800' },
  { value: 'negotiation', label: 'Negociación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'closed_won', label: 'Ganado', color: 'bg-green-100 text-green-800' },
  { value: 'closed_lost', label: 'Perdido', color: 'bg-red-100 text-red-800' },
  { value: 'in_progress', label: 'En progreso', color: 'bg-cyan-100 text-cyan-800' },
], []);

const PRIORITIES = useMemo(() => [
  { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Media', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' },
], []);

const EnhancedOpportunitiesTableComponent = ({ opportunities, loading }: EnhancedOpportunitiesTableProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities;

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de etapa
    if (stageFilter !== 'all') {
      filtered = filtered.filter(opp => opp.stage === stageFilter);
    }

    // Aplicar filtro de prioridad
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(opp => opp.priority === priorityFilter);
    }

    // Aplicar ordenación
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Manejar campos anidados
      if (sortField === 'company') {
        aValue = a.company?.name || '';
        bValue = b.company?.name || '';
      }

      // Convertir a string si es necesario para comparación
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [opportunities, searchTerm, stageFilter, priorityFilter, sortField, sortDirection]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const getSortIcon = useCallback((field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  }, [sortField, sortDirection]);

  const formatCurrency = useCallback((amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  }, []);

  const getStageInfo = useCallback((stage: string) => {
    return STAGES.find(s => s.value === stage) || STAGES[0];
  }, [STAGES]);

  const getPriorityInfo = useCallback((priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  }, [PRIORITIES]);

  const handleOpportunityClick = useCallback((opportunity: OpportunityWithContacts) => {
    navigate(`/opportunities/${opportunity.id}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-10 w-80 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="border rounded-lg">
          <div className="h-12 bg-muted animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de filtrado y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              {STAGES.map(stage => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              {PRIORITIES.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Oportunidad
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('company')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Empresa
                  {getSortIcon('company')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('stage')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Etapa
                  {getSortIcon('stage')}
                </Button>
              </TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('value')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Valor
                  {getSortIcon('value')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('probability')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Probabilidad
                  {getSortIcon('probability')}
                </Button>
              </TableHead>
              <TableHead>Contactos</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('created_at')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Fecha creación
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedOpportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {searchTerm || stageFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No se encontraron oportunidades con los filtros aplicados.'
                    : 'No hay oportunidades disponibles.'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedOpportunities.map((opportunity) => {
                const stageInfo = getStageInfo(opportunity.stage);
                const priorityInfo = getPriorityInfo(opportunity.priority || 'medium');
                
                return (
                  <TableRow 
                    key={opportunity.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpportunityClick(opportunity)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        {opportunity.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {opportunity.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {opportunity.company?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={stageInfo.color}>
                        {stageInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityInfo.color}>
                        {priorityInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        {formatCurrency(opportunity.value)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        {opportunity.probability || 50}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {opportunity.contacts?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(opportunity.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredAndSortedOpportunities.length} de {opportunities.length} oportunidades
      </div>
    </div>
  );
};

export const EnhancedOpportunitiesTable = React.memo(EnhancedOpportunitiesTableComponent, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.opportunities.length === nextProps.opportunities.length &&
    prevProps.opportunities.every((opp, index) => 
      opp.id === nextProps.opportunities[index]?.id &&
      opp.updated_at === nextProps.opportunities[index]?.updated_at
    )
  );
});