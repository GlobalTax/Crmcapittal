import { useState } from "react";
import { Text } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/Lead";
import { Search, Filter, Users, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useDraggable } from "@dnd-kit/core";

interface UnassignedLeadsPoolProps {
  leads: Lead[];
  selectedLeads: string[];
  onLeadSelect: (leadIds: string[]) => void;
}

interface DraggableLeadItemProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (leadId: string, selected: boolean) => void;
}

const DraggableLeadItem = ({ lead, isSelected, onSelect }: DraggableLeadItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'destructive';
      case 'CONTACTED': return 'warning';
      case 'QUALIFIED': return 'success';
      default: return 'secondary';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'website_form': return '🌐';
      case 'linkedin': return '💼';
      case 'referral': return '👥';
      case 'email_campaign': return '📧';
      default: return '📋';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all
        ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
        ${isDragging ? 'shadow-lg z-50' : 'hover:shadow-sm'}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(lead.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Text weight="medium" className="truncate">
                {lead.name}
              </Text>
              <Text variant="small" color="muted" className="truncate">
                {lead.email}
              </Text>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-sm">{getSourceIcon(lead.source)}</span>
              <Badge variant={getStatusColor(lead.status)}>
                {lead.status}
              </Badge>
            </div>
          </div>

          {/* Company and Details */}
          {lead.company_name && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <Text variant="small" color="muted" className="truncate">
                {lead.company_name}
              </Text>
            </div>
          )}

          {/* Estimated Value */}
          {lead.valor_estimado && (
            <div className="flex items-center gap-1">
              <Text variant="small" weight="medium" className="text-success">
                €{lead.valor_estimado.toLocaleString()}
              </Text>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <Text variant="xs" color="muted">
                {formatDistanceToNow(new Date(lead.created_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </Text>
            </div>
            
            {lead.lead_score && (
              <Badge variant="outline">
                Score: {lead.lead_score}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const UnassignedLeadsPool = ({ leads, selectedLeads, onLeadSelect }: UnassignedLeadsPoolProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allLeadIds = filteredLeads.map(lead => lead.id);
      onLeadSelect([...new Set([...selectedLeads, ...allLeadIds])]);
    } else {
      const filteredLeadIds = filteredLeads.map(lead => lead.id);
      onLeadSelect(selectedLeads.filter(id => !filteredLeadIds.includes(id)));
    }
  };

  const handleLeadSelect = (leadId: string, selected: boolean) => {
    if (selected) {
      onLeadSelect([...selectedLeads, leadId]);
    } else {
      onLeadSelect(selectedLeads.filter(id => id !== leadId));
    }
  };

  const allFilteredSelected = filteredLeads.length > 0 && 
    filteredLeads.every(lead => selectedLeads.includes(lead.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Text variant="large" weight="semibold">Leads Sin Asignar</Text>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md bg-background"
          >
            <option value="all">Todos los estados</option>
            <option value="NEW">Nuevos</option>
            <option value="CONTACTED">Contactados</option>
            <option value="QUALIFIED">Calificados</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md bg-background"
          >
            <option value="all">Todas las fuentes</option>
            <option value="website_form">Web Form</option>
            <option value="linkedin">LinkedIn</option>
            <option value="referral">Referral</option>
            <option value="email_campaign">Email Campaign</option>
          </select>
        </div>
      </div>

      {/* Select All */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected}
              onCheckedChange={handleSelectAll}
            />
            <Text variant="small">
              Seleccionar todos ({filteredLeads.length})
            </Text>
          </div>
          
          {selectedLeads.length > 0 && (
            <Badge variant="default">
              {selectedLeads.length} seleccionados
            </Badge>
          )}
        </div>
      )}

      {/* Leads List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <Text color="muted">No hay leads sin asignar</Text>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <DraggableLeadItem
              key={lead.id}
              lead={lead}
              isSelected={selectedLeads.includes(lead.id)}
              onSelect={handleLeadSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};