import { useState } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { EmailStatsCard } from "@/components/dashboard/EmailStatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLeads } from "@/hooks/useLeads";
import { useUsers } from "@/hooks/useUsers";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { OptimizedLeadsTable } from "@/components/leads/OptimizedLeadsTable";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { LeadDetailDialog } from "@/components/leads/LeadDetailDialog";
import { ExportLeadsDialog } from "@/components/leads/ExportLeadsDialog";
import { LeadNurturingPipeline } from "@/components/leads/LeadNurturingPipeline";
import { LeadAnalyticsDashboard } from "@/components/leads/LeadAnalyticsDashboard";
import { AdvancedFiltersPanel } from "@/components/leads/AdvancedFiltersPanel";
import { LeadStatus } from "@/types/Lead";
import { useAdvancedLeadFilters } from "@/hooks/useAdvancedLeadFilters";
import { useLeadsPagination } from "@/hooks/useLeadsPagination";
import { useLeadsCache } from "@/hooks/useLeadsCache";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/PaginationControls";
import { Bell, Users, TrendingUp, UserCheck, Heart, CheckCircle, XCircle, BarChart3, Settings, Zap } from "lucide-react";

const Dashboard = () => {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [useOptimizedTable, setUseOptimizedTable] = useState(true);

  const { users } = useUsers();

  const basicFilters = {
    ...(statusFilter !== 'all' && { status: statusFilter as LeadStatus }),
    ...(assignedFilter !== 'all' && { assigned_to_id: assignedFilter })
  };

  const {
    leads: allLeads,
    isLoading,
    createLead,
    updateLead,
    deleteLead,
    convertLead,
    isCreating,
    isConverting
  } = useLeads(basicFilters);

  // Advanced filtering
  const {
    filters: advancedFilters,
    filteredLeads,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filterStats
  } = useAdvancedLeadFilters(allLeads);

  // Pagination
  const {
    paginatedLeads,
    paginationConfig,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination
  } = useLeadsPagination(filteredLeads, 50);

  // Caching for performance
  const { metrics: cachedMetrics, getCacheInfo } = useLeadsCache(filteredLeads);

  const stats = [
    {
      title: "Total Leads",
      value: filterStats.total,
      description: "Leads en el sistema",
      icon: Bell,
    },
    {
      title: "Filtrados",
      value: filterStats.filtered,
      description: `${filterStats.percentage}% del total`,
      icon: Users,
    },
    {
      title: "Nuevos",
      value: filteredLeads.filter(l => l.status === 'NEW').length,
      description: "Pendientes de contacto",
      icon: TrendingUp,
    },
    {
      title: "Calificados",
      value: filteredLeads.filter(l => l.status === 'QUALIFIED').length,
      description: "Listos para conversión",
      icon: UserCheck,
    },
    {
      title: "Nutriendo",
      value: filteredLeads.filter(l => l.status === 'NURTURING').length,
      description: "En seguimiento automatizado",
      icon: Heart,
    },
    {
      title: "Convertidos",
      value: filteredLeads.filter(l => l.status === 'CONVERTED').length,
      description: "Transformados en clientes",
      icon: CheckCircle,
    },
    {
      title: "Perdidos",
      value: filteredLeads.filter(l => l.status === 'LOST').length,
      description: "Oportunidades perdidas",
      icon: XCircle,
    },
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

  const handleViewLead = (leadId: string) => {
    const lead = filteredLeads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setDetailDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Control Leads</h2>
          <p className="text-muted-foreground">
            Gestiona y convierte tus leads en oportunidades de negocio.
          </p>
        </div>
        <div className="flex gap-2">
          <ExportLeadsDialog leads={filteredLeads} />
          <CreateLeadDialog onCreateLead={createLead} isCreating={isCreating} />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Avanzados</TabsTrigger>
          <TabsTrigger value="table">Lista Optimizada</TabsTrigger>
          <TabsTrigger value="nurturing">Nurturing & Automatización</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.slice(0, 4).map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.slice(4).map((stat, index) => (
          <StatsCard key={index + 4} {...stat} />
        ))}
      </div>

      {/* Email Stats Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Estadísticas de Email</h3>
        <EmailStatsCard />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="status-filter">Estado</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
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
        <div className="flex-1">
          <Label htmlFor="assigned-filter">Asignado a</Label>
          <Select value={assignedFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <LeadsTable
            leads={paginatedLeads}
            onViewLead={handleViewLead}
            onDeleteLead={handleDeleteLead}
            onAssignLead={handleAssignLead}
            onConvertLead={handleConvertLead}
            isLoading={isLoading}
            isConverting={isConverting}
          />
          
          {paginationConfig.totalPages > 1 && (
            <div className="mt-4">
              <PaginationControls
                config={paginationConfig}
                onPageChange={goToPage}
                onNextPage={goToNextPage}
                onPreviousPage={goToPreviousPage}
              />
            </div>
          )}
        </div>
      </div>

        <LeadDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          lead={selectedLead}
        />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <LeadAnalyticsDashboard leads={filteredLeads} />
        </TabsContent>

        <TabsContent value="table" className="space-y-6">
          {/* Advanced Filters */}
          <AdvancedFiltersPanel
            filters={advancedFilters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            filterStats={filterStats}
          />

          {/* Table Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={useOptimizedTable ? "default" : "outline"}
                size="sm"
                onClick={() => setUseOptimizedTable(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Vista Optimizada
              </Button>
              <Button
                variant={!useOptimizedTable ? "default" : "outline"}
                size="sm"
                onClick={() => setUseOptimizedTable(false)}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Vista Clásica
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Mostrando {paginatedLeads.length} de {filteredLeads.length} leads
            </div>
          </div>

          {/* Optimized Table */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              {useOptimizedTable ? (
                <OptimizedLeadsTable
                  leads={paginatedLeads}
                  onViewLead={handleViewLead}
                  onDeleteLead={handleDeleteLead}
                  onAssignLead={handleAssignLead}
                  onConvertLead={handleConvertLead}
                  isLoading={isLoading}
                  isConverting={isConverting}
                  height={600}
                />
              ) : (
                <LeadsTable
                  leads={paginatedLeads}
                  onViewLead={handleViewLead}
                  onDeleteLead={handleDeleteLead}
                  onAssignLead={handleAssignLead}
                  onConvertLead={handleConvertLead}
                  isLoading={isLoading}
                  isConverting={isConverting}
                />
              )}
              
              {paginationConfig.totalPages > 1 && (
                <div className="mt-4">
                  <PaginationControls
                    config={paginationConfig}
                    onPageChange={goToPage}
                    onNextPage={goToNextPage}
                    onPreviousPage={goToPreviousPage}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nurturing">
          <LeadNurturingPipeline />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;