
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  MoreHorizontal,
  Star,
  TrendingUp,
  Users,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { useOptimizedLeads } from '@/hooks/useOptimizedLeads';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { LeadStatus, LeadSource, Lead, CreateLeadData } from '@/types/Lead';
import { CollapsibleLeadPanel } from '@/components/unified/CollapsibleLeadPanel';
import { ConvertLeadDialog } from '@/components/leads/ConvertLeadDialog';
import { CreateLeadDialog } from '@/components/leads/CreateLeadDialog';
import { LeadEditDialog } from '@/components/leads/LeadEditDialog';

export const LeadControlCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const {
    leads,
    isLoading,
    error,
    refetch,
    createLead,
    updateLead,
    deleteLead,
    convertLead,
    isCreating,
    isUpdating,
    isDeleting,
    isConverting,
  } = useOptimizedLeads(filters);

  const { metrics } = useLeadsCache(leads, 'control-center');

  // Filter leads locally for search and source
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company_name && lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const handleCreateLead = (data: CreateLeadData) => {
    createLead(data);
    setShowCreateDialog(false);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditDialog(true);
  };

  const handleUpdateLead = (updates: any) => {
    if (selectedLead) {
      updateLead({ id: selectedLead.id, updates });
      setShowEditDialog(false);
      setSelectedLead(null);
    }
  };

  const handleConvertLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowConvertDialog(true);
  };

  const handleConfirmConvert = (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => {
    convertLead({ leadId, options });
    setShowConvertDialog(false);
    setSelectedLead(null);
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      QUALIFIED: 'bg-green-100 text-green-800',
      DISQUALIFIED: 'bg-red-100 text-red-800',
      NURTURING: 'bg-purple-100 text-purple-800',
      CONVERTED: 'bg-emerald-100 text-emerald-800',
      LOST: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.NEW;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error al cargar los leads</p>
        <Button onClick={() => refetch()} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with metrics */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Centro de Control de Leads</h1>
          <p className="text-muted-foreground">
            Gestiona y convierte tus leads de manera eficiente
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Lead
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{metrics.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa Conversión</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Promedio</p>
                <p className="text-2xl font-bold">{metrics.averageScore}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nuevos Hoy</p>
                <p className="text-2xl font-bold">
                  {leads.filter(l => 
                    new Date(l.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, email o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: LeadStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="NEW">Nuevo</SelectItem>
                <SelectItem value="CONTACTED">Contactado</SelectItem>
                <SelectItem value="QUALIFIED">Calificado</SelectItem>
                <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
                <SelectItem value="NURTURING">Nutriendo</SelectItem>
                <SelectItem value="CONVERTED">Convertido</SelectItem>
                <SelectItem value="LOST">Perdido</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={(value: LeadSource | 'all') => setSourceFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fuentes</SelectItem>
                <SelectItem value="website_form">Formulario Web</SelectItem>
                <SelectItem value="lead_marker">Lead Marker</SelectItem>
                <SelectItem value="capittal_market">Capital Market</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="referral">Referido</SelectItem>
                <SelectItem value="email_campaign">Campaña Email</SelectItem>
                <SelectItem value="social_media">Redes Sociales</SelectItem>
                <SelectItem value="cold_outreach">Prospección</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredLeads.length} de {leads.length} leads
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No se encontraron leads con los filtros aplicados</p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.id} className="relative">
              <CollapsibleLeadPanel
                lead={lead}
                onEdit={handleEditLead}
                onUpdate={handleUpdateLead}
              />
              
              {/* Quick Actions */}
              <div className="absolute top-4 right-16 flex gap-2">
                {lead.status !== 'CONVERTED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConvertLead(lead)}
                    disabled={isConverting}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Convertir
                  </Button>
                )}
                <Badge 
                  variant="outline" 
                  className={getStatusColor(lead.status)}
                >
                  {lead.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialogs */}
      <CreateLeadDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateLead={handleCreateLead}
        isCreating={isCreating}
      />

      <ConvertLeadDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        lead={selectedLead}
        onConvert={handleConfirmConvert}
        isConverting={isConverting}
      />

      {selectedLead && (
        <LeadEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          lead={selectedLead}
          onUpdateLead={handleUpdateLead}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};
