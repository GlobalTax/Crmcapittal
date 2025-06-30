
import { ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

type SortField = 'deal_name' | 'company_name' | 'deal_value' | 'created_at' | 'priority';

interface SortableTableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
}

export const SortableTableHeader = ({ field, children, onSort }: SortableTableHeaderProps) => (
  <TableHead 
    className="cursor-pointer hover:bg-gray-50 select-none"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      <ArrowUpDown className="h-4 w-4 text-gray-400" />
    </div>
  </TableHead>
);
