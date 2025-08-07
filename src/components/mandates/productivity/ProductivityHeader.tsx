import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { CreateMandateDialog } from '../CreateMandateDialog';
import { 
  RefreshCw, 
  Search, 
  Plus, 
  Download,
  AlertTriangle,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Filter,
  User
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductivityHeaderProps {
  mandates: BuyingMandate[];
  filters: Record<string, any>;
  searchTerm: string;
  onFiltersChange: (filters: Record<string, any>) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ProductivityHeader({
  mandates,
  filters,
  searchTerm,
  onFiltersChange,
  onSearchChange,
  onRefresh,
  isLoading
}: ProductivityHeaderProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Calculate intelligent stats
  const activeMandates = mandates.filter(m => m.status === 'active');
  const expiringMandates = mandates.filter(m => {
    if (!m.end_date) return false;
    const daysToEnd = Math.ceil((new Date(m.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysToEnd <= 7 && daysToEnd > 0;
  });
  const completedThisMonth = mandates.filter(m => {
    if (m.status !== 'completed') return false;
    const completedDate = new Date(m.updated_at);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
  });

  // Mock targets pending calculation (would be fetched from targets table)
  const targetsPending = activeMandates.length * 3; // Mock: avg 3 pending targets per mandate

  const quickFilters = [
    { 
      key: 'assigned_to_me', 
      label: 'Míos', 
      icon: User, 
      active: filters.assigned_to_me,
      onClick: () => onFiltersChange({ ...filters, assigned_to_me: !filters.assigned_to_me })
    },
    { 
      key: 'urgent', 
      label: 'Urgentes', 
      icon: AlertTriangle, 
      active: filters.urgent,
      onClick: () => onFiltersChange({ ...filters, urgent: !filters.urgent })
    },
    { 
      key: 'inactive_7d', 
      label: 'Sin actividad 7d+', 
      icon: Clock, 
      active: filters.inactive_7d,
      onClick: () => onFiltersChange({ ...filters, inactive_7d: !filters.inactive_7d })
    }
  ];

  const handleMandateCreated = () => {
    setShowCreateDialog(false);
    onRefresh();
  };

  return (
    <div className="border-b border-border bg-background p-6 space-y-6">
      {/* Title and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión Integral</h1>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Exportar Excel</DropdownMenuItem>
              <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
              <DropdownMenuItem>Exportar CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Mandato
          </Button>
        </div>
      </div>

      {/* Smart Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Activos"
          value={activeMandates.length}
          description="Mandatos en progreso"
          icon={<Target className="h-5 w-5" />}
          trend={{
            value: 12,
            label: "vs mes anterior",
            direction: "up"
          }}
        />
        
        <StatsCard
          title="Próximos a vencer"
          value={expiringMandates.length}
          description="< 7 días"
          icon={<AlertTriangle className="h-5 w-5" />}
          className={expiringMandates.length > 0 ? "border-warning/20 bg-warning/5" : ""}
        />
        
        <StatsCard
          title="Completados este mes"
          value={completedThisMonth.length}
          description="Mandatos finalizados"
          icon={<Calendar className="h-5 w-5" />}
          trend={{
            value: 8,
            label: "vs mes anterior",
            direction: "up"
          }}
        />
        
        <StatsCard
          title="Targets pendientes"
          value={targetsPending}
          description="Por contactar"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Search and Quick Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por mandato, cliente, sector..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.key}
              variant={filter.active ? "default" : "outline"}
              size="sm"
              onClick={filter.onClick}
              className="gap-2"
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
              {filter.active && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          ))}
          
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Más filtros
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).some(key => filters[key]) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {Object.entries(filters).map(([key, value]) => 
            value && (
              <Badge key={key} variant="secondary" className="gap-1">
                {quickFilters.find(f => f.key === key)?.label || key}
                <button 
                  onClick={() => onFiltersChange({ ...filters, [key]: false })}
                  className="ml-1 hover:bg-destructive/20 rounded-full"
                >
                  ×
                </button>
              </Badge>
            )
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onFiltersChange({})}
            className="text-muted-foreground"
          >
            Limpiar todos
          </Button>
        </div>
      )}

      {/* Create Mandate Dialog */}
      <CreateMandateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleMandateCreated}
      />
    </div>
  );
}