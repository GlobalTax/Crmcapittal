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
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CollapsibleFilters } from '@/components/ui/CollapsibleFilters';

interface OpportunitiesTableProps {
  deals: Deal[];
  loading: boolean;
  onDealClick?: (deal: Deal) => void;
}


const STAGES = [
  { name: 'Lead', color: 'text-blue-600' },
  { name: 'In Progress', color: 'text-yellow-600' },
  { name: 'Won', color: 'text-green-600' },
  { name: 'Lost', color: 'text-red-600' }
];

export const OpportunitiesTable = ({ deals, loading, onDealClick }: OpportunitiesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

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

    return filtered;
  }, [deals, searchTerm, stageFilter]);


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
    return stageConfig?.color || 'text-gray-600';
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
      {/* Búsqueda y filtros colapsables */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <CollapsibleFilters title="Filtros de búsqueda">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Etapa</label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las etapas" />
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
        </CollapsibleFilters>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Oportunidad</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Fecha creación</TableHead>
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
                    <span className={`text-sm font-medium ${getStageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
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