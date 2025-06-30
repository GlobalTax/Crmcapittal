
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "./SortableTableHeader";

type SortField = 'deal_name' | 'company_name' | 'deal_value' | 'created_at' | 'priority';

interface DealsTableHeaderProps {
  onSort: (field: SortField) => void;
}

export const DealsTableHeader = ({ onSort }: DealsTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <SortableTableHeader field="deal_name" onSort={onSort}>
          Nombre del Negocio
        </SortableTableHeader>
        <SortableTableHeader field="company_name" onSort={onSort}>
          Empresa
        </SortableTableHeader>
        <TableHead>Contacto</TableHead>
        <TableHead>Etapa</TableHead>
        <SortableTableHeader field="priority" onSort={onSort}>
          Prioridad
        </SortableTableHeader>
        <SortableTableHeader field="deal_value" onSort={onSort}>
          Valor
        </SortableTableHeader>
        <TableHead>Propietario</TableHead>
        <TableHead>Última Actividad</TableHead>
        <TableHead>Días en Pipeline</TableHead>
        <SortableTableHeader field="created_at" onSort={onSort}>
          Fecha Creación
        </SortableTableHeader>
        <TableHead className="w-[70px]">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};
