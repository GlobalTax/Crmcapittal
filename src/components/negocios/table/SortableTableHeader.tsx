
import { ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

type SortField = 'nombre_negocio' | 'valor_negocio' | 'created_at' | 'prioridad' | 'company_name';

interface SortableTableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
}

export const SortableTableHeader = ({ field, children, onSort }: SortableTableHeaderProps) => (
  <TableHead 
    className="cursor-pointer hover:bg-gray-50 select-none group"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-2">
      <span>{children}</span>
      <ArrowUpDown className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </TableHead>
);
