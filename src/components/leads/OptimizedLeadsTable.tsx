import React, { useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow as UITableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/Lead";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  MoreHorizontal, 
  Eye, 
  UserPlus, 
  Trash2, 
  ArrowRight, 
  User, 
  Building2, 
  Mail,
  Phone,
  Star
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OptimizedLeadsTableProps {
  leads: Lead[];
  onViewLead: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;
  onAssignLead: (leadId: string, userId: string) => void;
  onConvertLead?: (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => void;
  isLoading?: boolean;
  isConverting?: boolean;
  height?: number;
}

interface RowData {
  leads: Lead[];
  onViewLead: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;
  onAssignLead: (leadId: string, userId: string) => void;
  onConvertLead?: (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => void;
  isConverting: boolean;
}

const TableRow = React.memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: RowData;
}) => {
  const { leads, onViewLead, onDeleteLead, onAssignLead, onConvertLead, isConverting } = data;
  const lead = leads[index];

  const handleAssignClick = (leadId: string) => {
    // This would trigger the assign dialog
    console.log('Assign lead:', leadId);
  };

  const handleConvertClick = (lead: Lead) => {
    // This would trigger the convert dialog
    console.log('Convert lead:', lead.id);
  };

  const handleQuickConvert = (lead: Lead, type: 'contact' | 'company' | 'full') => {
    if (!onConvertLead) return;
    
    const options = {
      createCompany: type === 'company' || type === 'full',
      createDeal: type === 'full'
    };
    
    onConvertLead(lead.id, options);
  };

  const isConverted = (lead: Lead) => {
    return lead.status === 'QUALIFIED' || lead.status === 'CONVERTED';
  };

  return (
    <div style={style} className="flex items-center border-b hover:bg-muted/50 px-4">
      <div className="grid grid-cols-12 gap-4 w-full items-center">
        {/* Name & Contact */}
        <div className="col-span-3">
          <div className="font-medium truncate">{lead.name}</div>
          <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {lead.email}
          </div>
          {lead.phone && (
            <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </div>
          )}
        </div>

        {/* Company */}
        <div className="col-span-2 truncate">
          {lead.company_name && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{lead.company_name}</span>
            </div>
          )}
        </div>

        {/* Source & Score */}
        <div className="col-span-1">
          <Badge variant="outline" className="text-xs">
            {lead.source}
          </Badge>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-xs">{lead.lead_score}</span>
          </div>
        </div>

        {/* Status */}
        <div className="col-span-1">
          <LeadStatusBadge status={lead.status} />
        </div>

        {/* Priority & Quality */}
        <div className="col-span-1">
          {lead.priority && (
            <Badge 
              variant={lead.priority === 'HIGH' || lead.priority === 'URGENT' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {lead.priority}
            </Badge>
          )}
          {lead.quality && (
            <div className="text-xs text-muted-foreground mt-1">{lead.quality}</div>
          )}
        </div>

        {/* Assigned To */}
        <div className="col-span-2">
          {lead.assigned_to ? (
            <span className="text-sm">
              {lead.assigned_to.first_name} {lead.assigned_to.last_name}
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAssignClick(lead.id)}
              className="text-xs px-2 py-1"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Asignar
            </Button>
          )}
        </div>

        {/* Conversion Actions */}
        <div className="col-span-1">
          {isConverted(lead) ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓
            </Badge>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickConvert(lead, 'contact')}
                disabled={isConverting}
                title="Solo contacto"
                className="px-1 py-1 h-6 w-6"
              >
                <User className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickConvert(lead, 'company')}
                disabled={isConverting}
                title="Contacto + Empresa"
                className="px-1 py-1 h-6 w-6"
              >
                <Building2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="col-span-1 text-sm text-muted-foreground">
          {format(new Date(lead.created_at), 'dd/MM', { locale: es })}
        </div>

        {/* Actions */}
        <div className="col-span-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewLead(lead.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAssignClick(lead.id)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Reasignar
              </DropdownMenuItem>
              {!isConverted(lead) && (
                <DropdownMenuItem onClick={() => handleConvertClick(lead)}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Convertir
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDeleteLead(lead.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

TableRow.displayName = 'TableRow';

export const OptimizedLeadsTable = ({
  leads,
  onViewLead,
  onDeleteLead,
  onAssignLead,
  onConvertLead,
  isLoading,
  isConverting = false,
  height = 600
}: OptimizedLeadsTableProps) => {
  const rowData = useMemo(() => ({
    leads,
    onViewLead,
    onDeleteLead,
    onAssignLead,
    onConvertLead,
    isConverting
  }), [leads, onViewLead, onDeleteLead, onAssignLead, onConvertLead, isConverting]);

  if (leads.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay leads disponibles</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      {/* Header */}
      <div className="bg-muted/50 border-b">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 font-medium text-sm">
          <div className="col-span-3">Contacto</div>
          <div className="col-span-2">Empresa</div>
          <div className="col-span-1">Fuente/Score</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-1">Prioridad</div>
          <div className="col-span-2">Asignado</div>
          <div className="col-span-1">Conversión</div>
          <div className="col-span-1">Fecha</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Virtualized Body */}
      <List
        height={height}
        width="100%"
        itemCount={leads.length}
        itemSize={80}
        itemData={rowData}
        overscanCount={5}
      >
        {TableRow}
      </List>
    </div>
  );
};