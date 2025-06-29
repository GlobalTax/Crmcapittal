
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
import { MoreHorizontal, Eye, UserPlus, Trash2 } from "lucide-react";
import { Lead } from "@/types/Lead";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { AssignLeadDialog } from "./AssignLeadDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (leadId: string) => void;
  onDeleteLead: (leadId: string) => void;
  onAssignLead: (leadId: string, userId: string) => void;
  isLoading?: boolean;
}

export const LeadsTable = ({
  leads,
  onViewLead,
  onDeleteLead,
  onAssignLead,
  isLoading
}: LeadsTableProps) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (leads.length === 0) {
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
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
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
        </Table>
      </div>

      <AssignLeadDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleAssign}
      />
    </>
  );
};
