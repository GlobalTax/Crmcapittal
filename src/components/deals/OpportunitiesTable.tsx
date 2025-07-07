import React, { useState, useMemo } from 'react';
import { Deal } from '@/types/Deal';
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
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OpportunitiesTableProps {
  deals: Deal[];
  loading: boolean;
  onDealClick?: (deal: Deal) => void;
}

type SortField = 'title' | 'amount' | 'stage' | 'createdAt' | 'company';
type SortDirection = 'asc' | 'desc';

const STAGES = [
  { name: 'Lead', color: 'bg-blue-100 text-blue-800' },
  { name: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Won', color: 'bg-green-100 text-green-800' },
  { name: 'Lost', color: 'bg-red-100 text-red-800' }
];

export const OpportunitiesTable = ({ deals, loading, onDealClick }: OpportunitiesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const filteredAndSortedDeals = useMemo(() => {
    let filtered = deals;

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.contact?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de etapa
    if (stageFilter !== 'all') {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
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
  }, [deals, searchTerm, stageFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const getStageColor = (stage: string) => {
    const stageConfig = STAGES.find(s => s.name === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
  };

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
            placeholder="Buscar por empresa o contacto..."
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
                <SelectItem key={stage.name} value={stage.name}>
                  {stage.name}
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
              <TableHead>Contacto</TableHead>
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
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('amount')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Importe
                  {getSortIcon('amount')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('createdAt')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Fecha creación
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedDeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {searchTerm || stageFilter !== 'all' 
                    ? 'No se encontraron oportunidades con los filtros aplicados.'
                    : 'No hay oportunidades disponibles.'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedDeals.map((deal) => (
                <TableRow 
                  key={deal.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onDealClick?.(deal)}
                >
                  <TableCell className="font-medium">
                    {deal.title}
                  </TableCell>
                  <TableCell>
                    {deal.company?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{deal.contact?.name || '-'}</div>
                      {deal.contact?.email && (
                        <div className="text-sm text-muted-foreground">
                          {deal.contact.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStageColor(deal.stage)}>
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(deal.amount)}
                  </TableCell>
                  <TableCell>
                    {formatDate(deal.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredAndSortedDeals.length} de {deals.length} oportunidades
      </div>
    </div>
  );
};