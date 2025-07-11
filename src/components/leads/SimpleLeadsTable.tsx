import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOptimizedLeads } from "@/hooks/useOptimizedLeads";
import { LeadStatus, LeadSource, Lead } from "@/types/Lead";
import { Search, Plus, Phone, Mail, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateLeadDialog } from "./CreateLeadDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const SimpleLeadsTable = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter as LeadStatus })
  };

  const { leads, isLoading, createLead, updateLead, isCreating } = useOptimizedLeads(filters);

  // Apply search filter
  const filteredLeads = leads.filter(lead => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.company_name?.toLowerCase() || '').includes(query);
      if (!matchesSearch) return false;
    }
    
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
    
    return true;
  });

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
        {status}
      </Badge>
    );
  };

  const handleViewLead = (leadId: string) => {
    navigate(`/gestion-leads/${leadId}`);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
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
        </div>

        <Button onClick={() => setShowCreateDialog(true)} className="ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Crear lead
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Fecha de creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron leads
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleViewLead(lead.id)}
                        className="text-primary hover:underline font-medium text-left"
                      >
                        {lead.name}
                      </button>
                      <span className="text-sm text-muted-foreground">{lead.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.assigned_to ? (
                      <span className="text-primary">
                        {lead.assigned_to.first_name} {lead.assigned_to.last_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.company_name || (
                      <span className="text-muted-foreground">Sin empresa</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(lead.status)}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(lead.created_at), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
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
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateLead={createLead}
        isCreating={isCreating}
      />
    </div>
  );
};