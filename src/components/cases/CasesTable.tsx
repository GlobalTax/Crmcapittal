
import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Case } from "@/types/Case";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";

interface CasesTableProps {
  cases: Case[];
  loading: boolean;
  onRefetch: () => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { label: "Activo", variant: "default" as const },
    completed: { label: "Completado", variant: "secondary" as const },
    suspended: { label: "Suspendido", variant: "destructive" as const },
    cancelled: { label: "Cancelado", variant: "outline" as const },
  };

  return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const };
};

const getPriorityBadge = (priority: string) => {
  const priorityConfig = {
    low: { label: "Baja", variant: "secondary" as const },
    medium: { label: "Media", variant: "default" as const },
    high: { label: "Alta", variant: "destructive" as const },
    urgent: { label: "Urgente", variant: "destructive" as const },
  };

  return priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, variant: "outline" as const };
};

export const CasesTable = ({ cases, loading, onRefetch }: CasesTableProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay expedientes creados aún</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Área de Práctica</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead>Fecha de Inicio</TableHead>
          <TableHead>Horas</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((caseItem) => {
          const statusBadge = getStatusBadge(caseItem.status);
          const priorityBadge = getPriorityBadge(caseItem.priority);

          return (
            <TableRow key={caseItem.id}>
              <TableCell className="font-medium">{caseItem.case_number}</TableCell>
              <TableCell>{caseItem.title}</TableCell>
              <TableCell>
                {caseItem.contact?.name || 'Sin asignar'}
                {caseItem.company?.name && (
                  <div className="text-sm text-gray-500">{caseItem.company.name}</div>
                )}
              </TableCell>
              <TableCell>
                {caseItem.practice_area && (
                  <Badge 
                    variant="outline" 
                    style={{ backgroundColor: `${caseItem.practice_area.color}20`, borderColor: caseItem.practice_area.color }}
                  >
                    {caseItem.practice_area.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
              </TableCell>
              <TableCell>
                {caseItem.start_date 
                  ? formatDate(new Date(caseItem.start_date), 'dd MMM yyyy', { locale: es })
                  : 'Sin fecha'
                }
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{caseItem.actual_hours || 0}h trabajadas</div>
                  {caseItem.estimated_hours && (
                    <div className="text-gray-500">de {caseItem.estimated_hours}h estimadas</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
