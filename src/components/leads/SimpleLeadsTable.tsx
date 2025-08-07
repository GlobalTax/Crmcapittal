import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLeads } from "@/hooks/useLeads";
import { LeadStatus, LeadSource, LeadPriority, LeadQuality, Lead } from "@/types/Lead";
import { Search, Plus, Phone, Mail, Eye, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateLeadDialog } from "./CreateLeadDialog";
import { InlineEditCell } from "@/components/contacts/InlineEditCell";
import { CompanySelector } from "./CompanySelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Company } from "@/types/Company";
import { FixedSizeList as List } from 'react-window';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { scoreLeads } from "@/services/aiLeadScoring";
export const SimpleLeadsTable = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [localScores, setLocalScores] = useState<Record<string, { aiScore: number; temperature: 'hot' | 'warm' | 'cold'; scoreReasons: string[] }>>({});

  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter as LeadStatus })
  };

  const { leads, isLoading, createLead, updateLead, isCreating } = useLeads(filters);

  // Apply search + filters (including temperature)
  const filteredLeads = leads.filter(lead => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(query) ||
        (lead.email?.toLowerCase() || '').includes(query) ||
        (lead.company?.toLowerCase() || '').includes(query) ||
        (lead.position?.toLowerCase() || '').includes(query);
      if (!matchesSearch) return false;
    }
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;

    if (temperatureFilter !== 'all') {
      const override = localScores[lead.id];
      const score = override?.aiScore ?? (lead as any).aiScore ?? (lead as any).lead_score ?? 0;
      const temp = override?.temperature ?? (lead as any).temperature ?? temperatureFromScore(score);
      if (temp !== temperatureFilter) return false;
    }
    return true;
  });

  // Options for dropdowns
  const statusOptions = [
    { value: 'NEW', label: 'Nuevo' },
    { value: 'CONTACTED', label: 'Contactado' },
    { value: 'QUALIFIED', label: 'Calificado' },
    { value: 'DISQUALIFIED', label: 'Descalificado' },
    { value: 'NURTURING', label: 'En seguimiento' },
    { value: 'CONVERTED', label: 'Convertido' },
    { value: 'LOST', label: 'Perdido' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' }
  ];

  const qualityOptions = [
    { value: 'POOR', label: 'Pobre' },
    { value: 'FAIR', label: 'Regular' },
    { value: 'GOOD', label: 'Buena' },
    { value: 'EXCELLENT', label: 'Excelente' }
  ];

  // Convert options to string arrays for InlineEditCell
  const statusSelectOptions = statusOptions.map(opt => opt.value);
  const prioritySelectOptions = priorityOptions.map(opt => opt.value);
  const qualitySelectOptions = qualityOptions.map(opt => opt.value);

  const handleUpdate = async (leadId: string, field: string, value: any) => {
    try {
      await updateLead({ id: leadId, updates: { [field]: value } as any });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    }
  };

  const handleCompanySelect = async (leadId: string, company: Company | null) => {
    try {
      await updateLead({ 
        id: leadId, 
        updates: { 
          company_id: company?.id || null,
          company: company?.name || null
        } as any
      });
    } catch (error) {
      console.error('Error updating lead company:', error);
      toast.error('Error al actualizar la empresa del lead');
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    const variants = {
      'NEW': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONTACTED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'QUALIFIED': 'bg-green-100 text-green-800 border-green-200',
      'DISQUALIFIED': 'bg-red-100 text-red-800 border-red-200',
      'NURTURING': 'bg-purple-100 text-purple-800 border-purple-200',
      'CONVERTED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'LOST': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {statusOptions.find(opt => opt.value === status)?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: LeadPriority) => {
    if (!priority) return <span className="text-muted-foreground">-</span>;
    
    const variants = {
      'LOW': 'bg-gray-100 text-gray-800 border-gray-200',
      'MEDIUM': 'bg-blue-100 text-blue-800 border-blue-200',
      'HIGH': 'bg-orange-100 text-orange-800 border-orange-200',
      'URGENT': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge variant="outline" className={variants[priority]}>
        {priorityOptions.find(opt => opt.value === priority)?.label || priority}
      </Badge>
    );
  };

  const getQualityBadge = (quality?: LeadQuality) => {
    if (!quality) return <span className="text-muted-foreground">-</span>;
    
    const variants = {
      'POOR': 'bg-red-100 text-red-800 border-red-200',
      'FAIR': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'GOOD': 'bg-green-100 text-green-800 border-green-200',
      'EXCELLENT': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };

    return (
      <Badge variant="outline" className={variants[quality]}>
        {qualityOptions.find(opt => opt.value === quality)?.label || quality}
      </Badge>
    );
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const temperatureFromScore = (score: number): 'hot' | 'warm' | 'cold' => {
    if (score >= 80) return 'hot';
    if (score >= 50) return 'warm';
    return 'cold';
  };

  const getTempClasses = (temp: 'hot' | 'warm' | 'cold') => {
    switch (temp) {
      case 'hot':
        return 'bg-red-50 border border-red-200 text-red-700';
      case 'warm':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border border-gray-200 text-gray-600';
    }
  };

  const getScoreProgress = (score: number) => Math.max(10, Math.min(100, score));

  const handleRecalcScore = async (lead: Lead) => {
    try {
      const [res] = await scoreLeads([lead]);
      if (res) {
        setLocalScores(prev => ({
          ...prev,
          [lead.id]: { aiScore: res.aiScore, temperature: res.temperature, scoreReasons: res.scoreReasons }
        }));
        toast.success('Score recalculado');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al recalcular el score');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as LeadSource | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <SelectItem value="website_form">Formulario web</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="referral">Referencia</SelectItem>
              <SelectItem value="email_campaign">Campaña email</SelectItem>
              <SelectItem value="social_media">Redes sociales</SelectItem>
              <SelectItem value="cold_outreach">Contacto directo</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={temperatureFilter} onValueChange={(value) => setTemperatureFilter(value as 'all'|'hot'|'warm'|'cold')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Temperatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las temperaturas</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowCreateDialog(true)} className="ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Crear lead
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Oportunidad / Contacto</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Teléfono</TableHead>
              <TableHead className="min-w-[150px]">Empresa</TableHead>
              <TableHead className="min-w-[120px]">Valor Estimado</TableHead>
              <TableHead className="min-w-[120px]">Estado</TableHead>
              <TableHead className="min-w-[120px]">Prioridad</TableHead>
              <TableHead className="min-w-[100px]">Score IA</TableHead>
              <TableHead className="min-w-[100px]">Fuente</TableHead>
              <TableHead className="min-w-[120px]">Próximo contacto</TableHead>
              <TableHead className="min-w-[120px]">Fecha creación</TableHead>
              <TableHead className="min-w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="py-4">
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-16 w-full bg-muted/50 animate-pulse rounded" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  No se encontraron leads
                </TableCell>
              </TableRow>
            ) : filteredLeads.length > 100 ? (
              <TableRow>
                <TableCell colSpan={12} className="p-0">
                  <List
                    height={600}
                    width={"100%"}
                    itemCount={filteredLeads.length}
                    itemSize={80}
                    overscanCount={6}
                  >
                    {({ index, style }) => {
                      const lead = filteredLeads[index];
                      return (
                        <div style={style} className="border-b hover:bg-muted/50">
                          <div
                            className="grid items-center gap-4 px-4"
                            style={{ gridTemplateColumns: '250px 200px 120px 150px 120px 120px 120px 100px 100px 120px 120px 100px' }}
                          >
                            <div className="py-3">
                              <div className="space-y-1">
                                <button
                                  onClick={() => handleViewLead(lead.id)}
                                  className="font-medium text-primary hover:underline cursor-pointer text-left block"
                                >
                                  {lead.name}
                                </button>
                                <div className="text-xs text-muted-foreground">
                                  Contacto: {lead.name?.split(' - ')[0] || 'Sin contacto'}
                                </div>
                              </div>
                            </div>
                            <div className="py-3">
                              <InlineEditCell
                                value={lead.email}
                                type="email"
                                onSave={(value) => handleUpdate(lead.id, 'email', value)}
                              />
                            </div>
                            <div className="py-3">
                              <InlineEditCell
                                value={lead.phone || ''}
                                type="phone"
                                onSave={(value) => handleUpdate(lead.id, 'phone', value || null)}
                              />
                            </div>
                            <div className="py-3">
                              <CompanySelector
                                value={lead.company_id}
                                companyName={lead.company}
                                onSelect={(company) => handleCompanySelect(lead.id, company)}
                              />
                            </div>
                            <div className="py-3">
                              <InlineEditCell
                                value={(lead as any).estimated_value?.toString() || ''}
                                type="text"
                                onSave={(value) => handleUpdate(lead.id, 'estimated_value', value ? parseFloat(value as string) : null)}
                              />
                            </div>
                            <div className="py-3">
                              <InlineEditCell
                                value={lead.status || ''}
                                type="select"
                                options={statusSelectOptions}
                                onSave={(value) => handleUpdate(lead.id, 'status', value)}
                              />
                            </div>
                            <div className="py-3">
                              <InlineEditCell
                                value={lead.priority || ''}
                                type="select"
                                options={prioritySelectOptions}
                                onSave={(value) => handleUpdate(lead.id, 'priority', value || null)}
                              />
                            </div>
                            <div className="py-3">
                              {(() => {
                                const override = localScores[lead.id];
                                const score = override?.aiScore ?? (lead as any).aiScore ?? (lead as any).lead_score ?? 0;
                                const temp = override?.temperature ?? (lead as any).temperature ?? temperatureFromScore(score);
                                const reasons: string[] = override?.scoreReasons ?? (lead as any).scoreReasons ?? [];
                                return (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTempClasses(temp)}`}>
                                            {temp === 'hot' ? 'Hot' : temp === 'warm' ? 'Warm' : 'Cold'}
                                          </span>
                                          <div className="flex items-center space-x-2">
                                            <Progress value={getScoreProgress(score)} className="w-16 h-2" />
                                            <span className="text-sm font-medium w-8">{score}</span>
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      {reasons.length > 0 && (
                                        <TooltipContent side="top" className="max-w-xs">
                                          <div className="text-xs font-medium mb-1">Razones del score</div>
                                          <ul className="list-disc pl-4 space-y-1">
                                            {reasons.slice(0, 5).map((r, i) => (
                                              <li key={i} className="text-xs text-muted-foreground">{r}</li>
                                            ))}
                                          </ul>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })()}
                            </div>
                            <div className="py-3">
                              <span className="text-sm text-muted-foreground capitalize">
                                {(lead.source || '').replace('_', ' ')}
                              </span>
                            </div>
                            <div className="py-3">
                              <InlineEditCell
                                value={lead.next_follow_up_date || ''}
                                type="date"
                                onSave={(value) => handleUpdate(lead.id, 'next_follow_up_date', value || null)}
                              />
                            </div>
                            <div className="py-3">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(lead.created_at), "dd MMM yyyy", { locale: es })}
                              </span>
                            </div>
                            <div className="py-3">
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => handleViewLead(lead.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {lead.phone && (
                                  <Button variant="ghost" size="sm" onClick={() => handleCall(lead.phone!)}>
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => handleEmail(lead.email)}>
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleRecalcScore(lead)} title="Re-calcular Score">
                                  <RefreshCcw className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </List>
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleViewLead(lead.id)}
                        className="font-medium text-primary hover:text-primary-hover hover:underline cursor-pointer text-left block"
                      >
                        {lead.name}
                      </button>
                      <div className="text-xs text-muted-foreground">
                        Contacto: {lead.name?.split(' - ')[0] || 'Sin contacto'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <InlineEditCell
                      value={lead.email}
                      type="email"
                      onSave={(value) => handleUpdate(lead.id, 'email', value)}
                    />
                  </TableCell>
                  <TableCell>
                    <InlineEditCell
                      value={lead.phone || ''}
                      type="phone"
                      onSave={(value) => handleUpdate(lead.id, 'phone', value || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <CompanySelector
                      value={lead.company_id}
                      companyName={lead.company}
                      onSelect={(company) => handleCompanySelect(lead.id, company)}
                    />
                  </TableCell>
                  <TableCell>
                    <InlineEditCell
                      value={(lead as any).estimated_value?.toString() || ''}
                      type="text"
                      onSave={(value) => handleUpdate(lead.id, 'estimated_value', value ? parseFloat(value as string) : null)}
                    />
                  </TableCell>
                  <TableCell>
                    <InlineEditCell
                      value={lead.status || ''}
                      type="select"
                      options={statusSelectOptions}
                      onSave={(value) => handleUpdate(lead.id, 'status', value)}
                    />
                  </TableCell>
                  <TableCell>
                    <InlineEditCell
                      value={lead.priority || ''}
                      type="select"
                      options={prioritySelectOptions}
                      onSave={(value) => handleUpdate(lead.id, 'priority', value || null)}
                    />
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const override = localScores[lead.id];
                      const score = override?.aiScore ?? (lead as any).aiScore ?? (lead as any).lead_score ?? 0;
                      const temp = override?.temperature ?? (lead as any).temperature ?? temperatureFromScore(score);
                      const reasons: string[] = override?.scoreReasons ?? (lead as any).scoreReasons ?? [];
                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTempClasses(temp)}`}>
                                  {temp === 'hot' ? 'Hot' : temp === 'warm' ? 'Warm' : 'Cold'}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <Progress value={getScoreProgress(score)} className="w-16 h-2" />
                                  <span className="text-sm font-medium w-8">{score}</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            {reasons.length > 0 && (
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="text-xs font-medium mb-1">Razones del score</div>
                                <ul className="list-disc pl-4 space-y-1">
                                  {reasons.slice(0, 5).map((r, i) => (
                                    <li key={i} className="text-xs text-muted-foreground">{r}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground capitalize">
                      {(lead.source || '').replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <InlineEditCell
                      value={lead.next_follow_up_date || ''}
                      type="date"
                      onSave={(value) => handleUpdate(lead.id, 'next_follow_up_date', value || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), "dd MMM yyyy", { locale: es })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLead(lead.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {lead.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCall(lead.phone!)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmail(lead.email)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecalcScore(lead)}
                        title="Re-calcular Score"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredLeads.length} de {leads.length} leads
        </p>
      </div>

      <CreateLeadDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateLead={createLead}
        isCreating={isCreating}
      />
    </div>
  );
};