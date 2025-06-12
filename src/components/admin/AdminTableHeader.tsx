
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AdminTableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterSector: string;
  onSectorChange: (value: string) => void;
  uniqueSectors: string[];
  filteredCount: number;
  totalCount: number;
}

export const AdminTableHeader = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterSector,
  onSectorChange,
  uniqueSectors,
  filteredCount,
  totalCount
}: AdminTableHeaderProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Gestión de Operaciones</h2>
        <Badge variant="outline" className="text-xs">
          {filteredCount} de {totalCount} operaciones
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por empresa, sector o ubicación..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="available">Disponible</option>
          <option value="pending_review">Pendiente revisión</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
          <option value="in_process">En proceso</option>
          <option value="sold">Vendido</option>
          <option value="withdrawn">Retirado</option>
        </select>

        <select
          value={filterSector}
          onChange={(e) => onSectorChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos los sectores</option>
          {uniqueSectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
