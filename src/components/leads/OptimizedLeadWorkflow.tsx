import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { RevealSection } from '@/components/ui/RevealSection';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  Filter,
  X,
  Phone,
  Mail,
  User,
  Calendar,
  TrendingUp,
  Users,
  Target,
  AlertCircle
} from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { LeadStatus, LeadSource, LeadPriority, Lead } from '@/types/Lead';
import { OptimizedLeadTable } from './OptimizedLeadTable';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { CreateLeadDialog } from './CreateLeadDialog';
import { format, isAfter, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

type ViewMode = 'table' | 'kanban';

export const OptimizedLeadWorkflow = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter as LeadStatus }),
  };

  const { leads, isLoading, createLead, updateLead, isCreating } = useLeads(filters);

  // Apply all filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          lead.name.toLowerCase().includes(query) ||
          (lead.email?.toLowerCase() || '').includes(query) ||
          (lead.company?.toLowerCase() || '').includes(query);
        if (!matchesSearch) return false;
      }
      
      // Source filter
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) return false;
      
      // Quick filters
      if (quickFilter === 'nuevos_hoy') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const leadDate = new Date(lead.created_at);
        leadDate.setHours(0, 0, 0, 0);
        return leadDate.getTime() === today.getTime();
      }
      
      if (quickFilter === 'sin_contactar_3_dias') {
        const threeDaysAgo = subDays(new Date(), 3);
        return (!lead.last_contacted || new Date(lead.last_contacted) < threeDaysAgo) && 
               lead.status === 'NEW';
      }
      
      return true;
    });
  }, [leads, searchQuery, sourceFilter, priorityFilter, quickFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nuevosHoy = leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      leadDate.setHours(0, 0, 0, 0);
      return leadDate.getTime() === today.getTime();
    }).length;
    
    const listosContactar = leads.filter(lead => 
      lead.status === 'NEW' || 
      (lead.next_follow_up_date && new Date(lead.next_follow_up_date) <= new Date())
    ).length;
    
    // Calculate 7-day conversion rate
    const sevenDaysAgo = subDays(new Date(), 7);
    const leadsLast7Days = leads.filter(lead => 
      new Date(lead.created_at) >= sevenDaysAgo
    );
    const convertedLast7Days = leadsLast7Days.filter(lead => 
      lead.status === 'CONVERTED'
    );
    const conversionRate = leadsLast7Days.length > 0 
      ? (convertedLast7Days.length / leadsLast7Days.length) * 100 
      : 0;
    
    // Response rate (leads contacted vs leads responded)
    const contacted = leads.filter(lead => lead.status !== 'NEW');
    const responded = leads.filter(lead => 
      ['QUALIFIED', 'CONVERTED', 'NURTURING'].includes(lead.status)
    );
    const responseRate = contacted.length > 0 
      ? (responded.length / contacted.length) * 100 
      : 0;
    
    const sinContactar3Dias = leads.filter(lead => {
      const threeDaysAgo = subDays(new Date(), 3);
      return (!lead.last_contacted || new Date(lead.last_contacted) < threeDaysAgo) && 
             lead.status === 'NEW';
    }).length;
    
    return {
      nuevosHoy,
      listosContactar,
      conversionRate,
      responseRate,
      sinContactar3Dias
    };
  }, [leads]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || sourceFilter !== 'all' || priorityFilter !== 'all' || quickFilter;

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSourceFilter('all');
    setPriorityFilter('all');
    setQuickFilter(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards (toggle) */}
      <RevealSection storageKey="leads/stats" defaultCollapsed={false} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas" count={4}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nuevos hoy</p>
                  <p className="text-2xl font-bold">{stats.nuevosHoy}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Listos para contactar</p>
                  <p className="text-2xl font-bold">{stats.listosContactar}</p>
                  {stats.sinContactar3Dias > 0 && (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {stats.sinContactar3Dias} urgentes
                    </div>
                  )}
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion rate 7d</p>
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response rate</p>
                  <p className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </RevealSection>

      {/* Header with search and toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Prominent search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por nombre, email o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-base"
            />
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center space-x-1 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Lista
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </Button>
        </div>

        {/* Create lead button */}
        <Button onClick={() => setShowCreateDialog(true)} className="ml-4 h-11">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Lead
        </Button>
      </div>

      {/* Simplified filters */}
      <div className="flex items-center space-x-4 flex-wrap">
        {/* 3 main filters */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="NEW">Nuevo</SelectItem>
            <SelectItem value="CONTACTED">Contactado</SelectItem>
            <SelectItem value="QUALIFIED">Calificado</SelectItem>
            <SelectItem value="NURTURING">En seguimiento</SelectItem>
            <SelectItem value="CONVERTED">Convertido</SelectItem>
            <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
            <SelectItem value="LOST">Perdido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="website_form">Web</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="referral">Referencia</SelectItem>
            <SelectItem value="email_campaign">Email</SelectItem>
            <SelectItem value="cold_outreach">Outreach</SelectItem>
            <SelectItem value="event">Evento</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as LeadPriority | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="LOW">Baja</SelectItem>
            <SelectItem value="MEDIUM">Media</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="URGENT">Urgente</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick filters */}
        <div className="flex items-center space-x-2">
          <Button
            variant={quickFilter === 'nuevos_hoy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter(quickFilter === 'nuevos_hoy' ? null : 'nuevos_hoy')}
          >
            Nuevos hoy
          </Button>
          <Button
            variant={quickFilter === 'sin_contactar_3_dias' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter(quickFilter === 'sin_contactar_3_dias' ? null : 'sin_contactar_3_dias')}
            className={stats.sinContactar3Dias > 0 ? 'border-red-300 text-red-700' : ''}
          >
            Sin contactar 3+ días
            {stats.sinContactar3Dias > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {stats.sinContactar3Dias}
              </Badge>
            )}
          </Button>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {selectedLeads.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} seleccionado{selectedLeads.length > 1 ? 's' : ''}
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  Marcar contactado
                </Button>
                <Button size="sm" variant="outline">
                  Asignar a
                </Button>
                <Button size="sm" variant="outline">
                  Eliminar
                </Button>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setSelectedLeads([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Results counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredLeads.length} de {leads.length} leads
          {hasActiveFilters && <span className="text-blue-600 ml-1">(filtrado)</span>}
        </p>
      </div>

      {/* Main content - table or kanban */}
      {viewMode === 'table' ? (
        <OptimizedLeadTable
          leads={filteredLeads}
          isLoading={isLoading}
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAll={handleSelectAll}
          onUpdateLead={updateLead}
        />
      ) : (
        <LeadKanbanBoard />
      )}

      <CreateLeadDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateLead={createLead}
        isCreating={isCreating}
      />
    </div>
  );
};