import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOptimizedLeads } from "@/hooks/useOptimizedLeads";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { LeadStatus, LeadSource, LeadPriority } from "@/types/Lead";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  AlertCircle, 
  Users, 
  TrendingUp, 
  UserCheck, 
  Search, 
  RefreshCw, 
  Filter,
  Clock,
  Calendar,
  UserPlus,
  Phone,
  Mail,
  Eye,
  CheckSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface LeadControlCenterProps {
  onViewLead?: (leadId: string) => void;
}

export const LeadControlCenter = ({ onViewLead }: LeadControlCenterProps) => {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'all'>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter as LeadStatus }),
    ...(assignedFilter !== 'all' && { assigned_to_id: assignedFilter })
  };

  const {
    leads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    convertLead,
    isCreating,
    isConverting,
    refetch
  } = useOptimizedLeads(filters);

  // Manual refresh with visual feedback
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000); // Give visual feedback
  };

  // Filter leads by date
  const getFilteredLeadsByDate = (allLeads: typeof leads) => {
    if (dateFilter === 'all') return allLeads;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return allLeads.filter(lead => {
      const createdAt = new Date(lead.created_at);
      switch (dateFilter) {
        case 'today': return createdAt >= today;
        case 'week': return createdAt >= week;
        case 'month': return createdAt >= month;
        default: return true;
      }
    });
  };

  // Apply all filters
  const filteredLeads = getFilteredLeadsByDate(leads).filter(lead => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.company_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
    // Only filter by priority if it's not 'all' and lead has a priority value
    if (priorityFilter !== 'all' && lead.priority && lead.priority !== priorityFilter) return false;
    
    return true;
  });

  // Calculate stats for all leads and filtered
  const allStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED').length,
  };

  // Critical alerts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const newLeadsToday = leads.filter(lead => 
    lead.status === 'NEW' && new Date(lead.created_at) >= today
  );

  const unassignedOldLeads = leads.filter(lead => 
    lead.status === 'NEW' && 
    !lead.assigned_to_id && 
    new Date(lead.created_at) < yesterday
  );

  const stats = [
    {
      title: "Total Leads",
      value: allStats.total,
      description: "Leads en el sistema",
      icon: Users,
      onClick: () => {
        setStatusFilter('all');
        setDateFilter('all');
      }
    },
    {
      title: "Nuevos",
      value: allStats.new,
      description: "Pendientes de contacto",
      icon: AlertCircle,
      onClick: () => {
        setStatusFilter('NEW');
        setDateFilter('all');
      }
    },
    {
      title: "Contactados",
      value: allStats.contacted,
      description: "En proceso",
      icon: TrendingUp,
      onClick: () => {
        setStatusFilter('CONTACTED');
        setDateFilter('all');
      }
    },
    {
      title: "Calificados",
      value: allStats.qualified,
      description: "Listos para conversión",
      icon: UserCheck,
      onClick: () => {
        setStatusFilter('QUALIFIED');
        setDateFilter('all');
      }
    },
  ];

  // Quick filter buttons
  const quickFilters = [
    { label: "Todos", value: "all", count: allStats.total },
    { label: "Hoy", value: "today", count: newLeadsToday.length },
    { label: "Esta semana", value: "week", count: 0 }, // Calculate if needed
    { label: "Sin asignar", value: "unassigned", count: unassignedOldLeads.length },
  ];

  const handleAssignLead = (leadId: string, userId: string) => {
    updateLead({ id: leadId, updates: { assigned_to_id: userId } });
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      deleteLead(leadId);
    }
  };

  const handleConvertLead = (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => {
    convertLead({ leadId, options });
  };

  const handleBulkAction = (action: string) => {
    if (selectedLeads.length === 0) return;
    
    switch (action) {
      case 'assign':
        // Implement bulk assignment
        break;
      case 'delete':
        if (confirm(`¿Eliminar ${selectedLeads.length} leads seleccionados?`)) {
          selectedLeads.forEach(id => deleteLead(id));
          setSelectedLeads([]);
        }
        break;
      case 'convert':
        // Implement bulk conversion
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Control Center - Leads</h1>
          <p className="text-muted-foreground">
            Gestiona y convierte tus leads en oportunidades de negocio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <CreateLeadDialog onCreateLead={createLead} isCreating={isCreating} />
        </div>
      </div>

      {/* Critical Alerts Panel */}
      {(newLeadsToday.length > 0 || unassignedOldLeads.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas Críticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newLeadsToday.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium text-orange-800">
                    {newLeadsToday.length} leads nuevos hoy
                  </h4>
                  <p className="text-sm text-orange-600">Requieren atención inmediata</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setDateFilter('today')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Ver Leads
                </Button>
              </div>
            )}
            
            {unassignedOldLeads.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium text-red-800">
                    {unassignedOldLeads.length} leads sin asignar (+24h)
                  </h4>
                  <p className="text-sm text-red-600">Leads antiguos sin responsable</p>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    setStatusFilter('NEW');
                    setAssignedFilter('unassigned');
                  }}
                >
                  Asignar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} onClick={stat.onClick} className="cursor-pointer">
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={dateFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter(filter.value)}
            className="h-8"
          >
            {filter.label}
            {filter.count > 0 && (
              <Badge variant="secondary" className="ml-2 h-5">
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="NEW">Nuevo</SelectItem>
                <SelectItem value="CONTACTED">Contactado</SelectItem>
                <SelectItem value="QUALIFIED">Calificado</SelectItem>
                <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
                <SelectItem value="NURTURING">Nurturing</SelectItem>
                <SelectItem value="CONVERTED">Convertido</SelectItem>
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fuentes</SelectItem>
                <SelectItem value="website_form">Formulario Web</SelectItem>
                <SelectItem value="lead_marker">Lead Marker</SelectItem>
                <SelectItem value="capittal_market">Capital Market</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="referral">Referido</SelectItem>
                <SelectItem value="email_campaign">Email Campaign</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as LeadPriority | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="LOW">Baja</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter('all');
                setSourceFilter('all');
                setPriorityFilter('all');
                setAssignedFilter('all');
                setDateFilter('all');
                setSearchQuery('');
              }}
            >
              Limpiar
            </Button>
          </div>

          {/* Results summary */}
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredLeads.length} de {leads.length} leads
            {isRefreshing && <span className="ml-2 text-blue-600">• Actualizando...</span>}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {selectedLeads.length} leads seleccionados
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('assign')}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Asignar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('convert')}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Convertir
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  <UserCheck className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardContent className="p-6">
          <LeadsTable
            leads={filteredLeads}
            onViewLead={onViewLead || ((leadId) => console.log('Ver lead:', leadId))}
            onDeleteLead={handleDeleteLead}
            onAssignLead={handleAssignLead}
            onConvertLead={handleConvertLead}
            isLoading={isLoading}
            isConverting={isConverting}
            selectedLeads={selectedLeads}
            onSelectionChange={setSelectedLeads}
          />
        </CardContent>
      </Card>
    </div>
  );
};