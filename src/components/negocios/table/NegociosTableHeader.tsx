
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SortableTableHeader } from "./SortableTableHeader";

type SortField = 'nombre_negocio' | 'valor_negocio' | 'created_at' | 'prioridad' | 'company_name';

interface NegociosTableHeaderProps {
  onSort: (field: SortField) => void;
}

export const NegociosTableHeader = ({ onSort }: NegociosTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <SortableTableHeader field="nombre_negocio" onSort={onSort}>
          Nombre del Negocio
        </SortableTableHeader>
        <SortableTableHeader field="company_name" onSort={onSort}>
          Empresa
        </SortableTableHeader>
        <TableHead>Contacto</TableHead>
        <TableHead>Etapa</TableHead>
        <SortableTableHeader field="prioridad" onSort={onSort}>
          Prioridad
        </SortableTableHeader>
        <SortableTableHeader field="valor_negocio" onSort={onSort}>
          Valor
        </SortableTableHeader>
        <TableHead>Propietario</TableHead>
        <TableHead>Sector</TableHead>
        <TableHead>Días en Pipeline</TableHead>
        <SortableTableHeader field="created_at" onSort={onSort}>
          Fecha Creación
        </SortableTableHeader>
        <TableHead className="w-[70px]">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};
