
import React, { useState, useMemo } from 'react';
import { Transaccion } from '@/types/Transaccion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Building2, 
  User, 
  Calendar,
  Euro,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransaccionesTableProps {
  transacciones: Transaccion[];
  onEdit: (transaccion: Transaccion) => void;
  onView: (transaccion: Transaccion) => void;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const TransaccionesTable: React.FC<TransaccionesTableProps> = ({
  transacciones,
  onEdit,
  onView,
  onDelete,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique values for filters
  const uniqueStages = useMemo(() => {
    const stages = transacciones
      .map(t => t.stage)
      .filter(Boolean)
      .reduce((acc, stage) => {
        if (stage && !acc.find(s => s.id === stage.id)) {
          acc.push(stage);
        }
        return acc;
      }, [] as NonNullable<Transaccion['stage']>[]);
    return stages;
  }, [transacciones]);

  const uniqueTypes = useMemo(() => {
    return [...new Set(transacciones.map(t => t.tipo_transaccion))];
  }, [transacciones]);

  const uniquePriorities = useMemo(() => {
    return [...new Set(transacciones.map(t => t.prioridad))];
  }, [transacciones]);

  // Filter and sort transacciones
  const filteredAndSortedTransacciones = useMemo(() => {
    let filtered = transacciones.filter(transaccion => {
      const matchesSearch = searchTerm === '' || 
        transaccion.nombre_transaccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStage = filterStage === 'all' || transaccion.stage?.id === filterStage;
      const matchesType = filterType === 'all' || transaccion.tipo_transaccion === filterType;
      const matchesPriority = filterPriority === 'all' || transaccion.prioridad === filterPriority;

      return matchesSearch && matchesStage && matchesType && matchesPriority;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'nombre_transaccion':
          aValue = a.nombre_transaccion;
          bValue = b.nombre_transaccion;
          break;
        case 'valor_transaccion':
          aValue = a.valor_transaccion || 0;
          bValue = b.valor_transaccion || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transacciones, searchTerm, filterStage, filterType, filterPriority, sortBy, sortOrder]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getPriorityColor = (prioridad: string) => {
    const colors: Record<string, string> = {
      'urgente': 'destructive',
      'alta': 'destructive',
      'media': 'default',
      'baja': 'secondary'
    };
    return colors[prioridad] || 'default';
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStage('all');
    setFilterType('all');
    setFilterPriority('all');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Lista de Transacciones ({filteredAndSortedTransacciones.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 pt-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              {uniqueStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniquePriorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchTerm || filterStage !== 'all' || filterType !== 'all' || filterPriority !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('nombre_transaccion')}
                >
                  Transacción {sortBy === 'nombre_transaccion' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('valor_transaccion')}
                >
                  Valor {sortBy === 'valor_transaccion' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('updated_at')}
                >
                  Actualizada {sortBy === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransacciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {transacciones.length === 0 
                      ? 'No hay transacciones para mostrar'
                      : 'No se encontraron transacciones que coincidan con los filtros'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTransacciones.map((transaccion) => (
                  <TableRow key={transaccion.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{transaccion.nombre_transaccion}</div>
                        {transaccion.sector && (
                          <div className="text-sm text-muted-foreground">{transaccion.sector}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {transaccion.company ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{transaccion.company.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {transaccion.contact ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{transaccion.contact.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <Euro className="h-4 w-4" />
                        {formatCurrency(transaccion.valor_transaccion)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaccion.tipo_transaccion}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {transaccion.stage ? (
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: `${transaccion.stage.color}20`, color: transaccion.stage.color }}
                        >
                          {transaccion.stage.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Sin etapa</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getPriorityColor(transaccion.prioridad) as any}>
                        {transaccion.prioridad}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(transaccion.updated_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(transaccion)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(transaccion)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(transaccion.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
