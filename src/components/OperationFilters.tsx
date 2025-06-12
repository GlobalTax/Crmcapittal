
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Operation } from "@/types/Operation";
import { useUserRole } from "@/hooks/useUserRole";

interface OperationFiltersProps {
  operations: Operation[];
  onFilter: (filtered: Operation[]) => void;
}

export const OperationFilters = ({ operations, onFilter }: OperationFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { role } = useUserRole();

  const sectors = Array.from(new Set(operations.map(op => op.sector)));
  
  const clearFilters = () => {
    setSearchTerm("");
    setSectorFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  useEffect(() => {
    let filtered = operations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(op =>
        op.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.buyer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.seller?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by sector
    if (sectorFilter !== "all") {
      filtered = filtered.filter(op => op.sector === sectorFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(op => op.operation_type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(op => op.status === statusFilter);
    }

    onFilter(filtered);
  }, [searchTerm, sectorFilter, typeFilter, statusFilter, operations, onFilter]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border-black mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="font-medium text-slate-900">Filtros</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearFilters}
          className="text-slate-600"
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar operaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Sector</label>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los sectores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los sectores</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector} value={sector}>{sector}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tipo</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="acquisition">Adquisición</SelectItem>
              <SelectItem value="merger">Fusión</SelectItem>
              <SelectItem value="sale">Venta</SelectItem>
              <SelectItem value="ipo">OPV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Estado</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              {(role === 'admin' || role === 'superadmin') && (
                <>
                  <SelectItem value="pending_review">Pendiente Revisión</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                </>
              )}
              <SelectItem value="in_process">En Proceso</SelectItem>
              <SelectItem value="sold">Vendida</SelectItem>
              <SelectItem value="withdrawn">Retirada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
