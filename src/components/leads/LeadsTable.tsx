import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, UserPlus, Trash2, ArrowRight, User, Building2, Briefcase, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/Lead";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { AssignLeadDialog } from "./AssignLeadDialog";
import { ConvertLeadDialog } from "./ConvertLeadDialog";
import { EmailTemplateDialog } from "./EmailTemplateDialog";
import { LeadsTableSkeleton } from "@/components/LoadingSkeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;
  onAssignLead: (leadId: string, userId: string) => void;
  onConvertLead?: (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => void;
  isLoading?: boolean;
  isConverting?: boolean;
}

export const LeadsTable = ({
  leads,
  onViewLead,
  onDeleteLead,
  onAssignLead,
  onConvertLead,
  isLoading,
  isConverting = false
}: LeadsTableProps) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleAssignClick = (leadId: string) => {
    setSelectedLeadId(leadId);
    setAssignDialogOpen(true);
  };

  const handleAssign = (userId: string) => {
    if (selectedLeadId) {
      onAssignLead(selectedLeadId, userId);
    }
    setAssignDialogOpen(false);
    setSelectedLeadId('');
  };

  const handleConvertClick = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertDialogOpen(true);
  };

  const handleQuickConvert = (lead: Lead, type: 'contact' | 'company' | 'full') => {
    if (!onConvertLead) {
      toast.error('Función de conversión no disponible');
      return;
    }

    const options = {
      createCompany: type === 'company' || type === 'full',
      createDeal: type === 'full'
    };

    onConvertLead(lead.id, options);
    
    const messages = {
      contact: 'Lead convertido a contacto',
      company: 'Lead convertido a contacto y empresa',
      full: 'Lead convertido completamente (contacto, empresa y negocio)'
    };
    
    toast.success(messages[type]);
  };

  const handleConvert = (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => {
    if (!onConvertLead) {
      toast.error('Función de conversión no disponible');
      return;
    }
    
    onConvertLead(leadId, options);
  };

  const handleEmailClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEmailDialogOpen(true);
  };

  const isConverted = (lead: Lead) => {
    return lead.status === 'QUALIFIED'; // Assuming QUALIFIED means converted
  };

  if (leads.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay leads disponibles</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Compañía</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Conversión</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <LeadsTableSkeleton count={6} />
          ) : (
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.company_name || '-'}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    {lead.assigned_to ? (
                      <span className="text-sm">
                        {lead.assigned_to.first_name} {lead.assigned_to.last_name}
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignClick(lead.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Asignar
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {isConverted(lead) ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Convertido
                      </Badge>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickConvert(lead, 'contact')}
                          disabled={isConverting}
                          title="Solo contacto"
                          className="px-2"
                        >
                          <User className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickConvert(lead, 'company')}
                          disabled={isConverting}
                          title="Contacto + Empresa"
                          className="px-2"
                        >
                          <Building2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertClick(lead)}
                          disabled={isConverting}
                          title="Conversión personalizada"
                          className="px-2"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
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
                        <DropdownMenuItem onClick={() => handleEmailClick(lead)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Email
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <AssignLeadDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleAssign}
      />

      <ConvertLeadDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        lead={selectedLead}
        onConvert={handleConvert}
        isConverting={isConverting}
      />

      <EmailTemplateDialog
        lead={selectedLead}
      />
    </>
  );
};
