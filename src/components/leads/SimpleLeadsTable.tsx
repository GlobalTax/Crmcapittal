
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Mail, Edit, Trash2 } from "lucide-react";
import { useLeadContacts } from "@/hooks/useLeadContacts";
import { Contact } from "@/types/Contact";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'NEW': return 'destructive';
    case 'CONTACTED': return 'warning';
    case 'QUALIFIED': return 'success';
    case 'DISQUALIFIED': return 'secondary';
    default: return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'NEW': return 'Nuevo';
    case 'CONTACTED': return 'Contactado';
    case 'QUALIFIED': return 'Cualificado';
    case 'DISQUALIFIED': return 'Descalificado';
    default: return status || 'Sin estado';
  }
};

export const SimpleLeadsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  const { leads, isLoading, deleteLead, isDeleting } = useLeadContacts();

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este lead?')) {
      deleteLead(leadId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-64 h-10 bg-muted animate-pulse rounded"></div>
          <div className="w-32 h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredLeads.length} de {leads.length} leads
        {selectedLeads.length > 0 && ` • ${selectedLeads.length} seleccionados`}
      </div>

      {/* Leads Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-4 font-medium">Nombre</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Empresa</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-left p-4 font-medium">Puntuación</th>
                <th className="text-left p-4 font-medium">Fecha</th>
                <th className="text-left p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    {searchTerm ? 'No se encontraron leads que coincidan con la búsqueda' : 'No hay leads registrados'}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t hover:bg-muted/25">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{lead.name}</div>
                      {lead.position && (
                        <div className="text-sm text-muted-foreground">{lead.position}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span>{lead.email}</span>
                        {lead.email && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>{lead.company || '-'}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusColor(lead.lead_status || '')}>
                        {getStatusLabel(lead.lead_status || '')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{lead.lead_score || 0}</span>
                        <span className="text-xs text-muted-foreground">pts</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {lead.phone && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedLeads.length} leads seleccionados</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline">
              Cambiar estado
            </Button>
            <Button size="sm" variant="outline">
              Asignar usuario
            </Button>
            <Button size="sm" variant="destructive">
              Eliminar seleccionados
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
