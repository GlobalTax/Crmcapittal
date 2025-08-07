import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { SmartAlerts } from './SmartAlerts';
import { InlineMandateDetail } from './InlineMandateDetail';
import { BuyingMandate } from '@/types/BuyingMandate';
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  UserPlus, 
  Activity,
  MoreHorizontal,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HybridMandatesListProps {
  mandates: BuyingMandate[];
  filters: Record<string, any>;
  searchTerm: string;
  selectedMandate: BuyingMandate | null;
  onMandateSelect: (mandate: BuyingMandate) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function HybridMandatesList({
  mandates,
  filters,
  searchTerm,
  selectedMandate,
  onMandateSelect,
  onRefresh,
  isLoading
}: HybridMandatesListProps) {
  const [selectedMandates, setSelectedMandates] = useState<string[]>([]);

  // Filter mandates based on search and filters
  const filteredMandates = useMemo(() => {
    return mandates.filter(mandate => {
      // Search filter
      const matchesSearch = !searchTerm || 
        mandate.mandate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandate.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mandate.target_sectors?.some(sector => 
          sector.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Quick filters
      if (filters.assigned_to_me) {
        // TODO: Check if mandate is assigned to current user
      }
      
      if (filters.urgent) {
        const daysToEnd = mandate.end_date ? 
          Math.ceil((new Date(mandate.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
          999;
        if (daysToEnd > 7) return false;
      }
      
      if (filters.inactive_7d) {
        const daysSinceUpdate = Math.ceil((new Date().getTime() - new Date(mandate.updated_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate < 7) return false;
      }

      return matchesSearch;
    });
  }, [mandates, searchTerm, filters]);

  const handleSelectMandate = (mandateId: string, checked: boolean) => {
    if (checked) {
      setSelectedMandates(prev => [...prev, mandateId]);
    } else {
      setSelectedMandates(prev => prev.filter(id => id !== mandateId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMandates(filteredMandates.map(m => m.id));
    } else {
      setSelectedMandates([]);
    }
  };

  const getStatusProgress = (status: BuyingMandate['status']) => {
    switch (status) {
      case 'active': return 50;
      case 'paused': return 25;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getStatusBadge = (status: BuyingMandate['status']) => {
    const config = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const }
    };
    return config[status] || config.active;
  };

  const formatDaysToDeadline = (endDate?: string) => {
    if (!endDate) return 'Sin fecha';
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Vencido';
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `${days} días`;
  };

  const mockTargetsData = (mandateId: string) => {
    // Mock data - would be fetched from targets table
    const contacted = Math.floor(Math.random() * 15) + 5;
    const total = contacted + Math.floor(Math.random() * 10) + 3;
    return { contacted, total };
  };

  const mockNextAction = (mandateId: string) => {
    const actions = [
      'Llamar Target #5 en 2 días',
      'Enviar NDA a ProspectCorp',
      'Seguimiento reunión cliente',
      'Preparar presentación sector',
      'Revisar nuevos targets'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  if (isLoading && mandates.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando mandatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Results Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              {filteredMandates.length} mandatos encontrados
              {Object.keys(filters).some(key => filters[key]) && (
                <Badge variant="secondary" className="ml-2">
                  Filtrado
                </Badge>
              )}
            </p>
          </div>
          
          {selectedMandates.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedMandates.length} seleccionados
              </span>
              <Button variant="outline" size="sm">
                Actualizar estado
              </Button>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                Asignar a
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedMandates.length === filteredMandates.length && filteredMandates.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Mandato</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Próxima Acción</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Alertas</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMandates.map((mandate) => {
              const isExpanded = selectedMandate?.id === mandate.id;
              const isSelected = selectedMandates.includes(mandate.id);
              const statusBadge = getStatusBadge(mandate.status);
              const targets = mockTargetsData(mandate.id);
              const nextAction = mockNextAction(mandate.id);
              
              return (
                <>
                  <TableRow 
                    key={mandate.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isExpanded ? 'bg-muted/30' : ''}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectMandate(mandate.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    
                    <TableCell onClick={() => onMandateSelect(mandate)}>
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">{mandate.mandate_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {mandate.target_sectors?.slice(0, 2).join(', ')}
                            {mandate.target_sectors && mandate.target_sectors.length > 2 && ' +'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">{mandate.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {mandate.client_contact}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                        <Progress 
                          value={getStatusProgress(mandate.status)} 
                          className="h-1"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {targets.contacted}/{targets.total} contactados
                        </div>
                        <Progress 
                          value={(targets.contacted / targets.total) * 100} 
                          className="h-1"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">{nextAction}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {formatDaysToDeadline(mandate.end_date)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <SmartAlerts mandate={mandate} />
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            Ver targets
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Añadir target
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Activity className="h-4 w-4" />
                            Marcar actividad
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <InlineMandateDetail 
                          mandate={mandate}
                          onClose={() => onMandateSelect(mandate)}
                          onRefresh={onRefresh}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredMandates.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {mandates.length === 0 ? 'No hay mandatos creados' : 'No se encontraron mandatos'}
            </h3>
            <p className="text-muted-foreground">
              {mandates.length === 0 
                ? 'Crea tu primer mandato para comenzar'
                : 'Intenta ajustar los filtros o el término de búsqueda'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}