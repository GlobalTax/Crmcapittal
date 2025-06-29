
import { useState } from "react";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { TargetCompany, TargetStatus } from "@/types/TargetCompany";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Search, ExternalLink, User, Star } from "lucide-react";
import { EditTargetCompanyDialog } from "./EditTargetCompanyDialog";
import { TargetCompanyDetailsDialog } from "./TargetCompanyDetailsDialog";
import { ConvertToOperationDialog } from "./ConvertToOperationDialog";

const statusColors: Record<TargetStatus, string> = {
  'IDENTIFIED': 'bg-gray-100 text-gray-800',
  'RESEARCHING': 'bg-blue-100 text-blue-800',
  'OUTREACH_PLANNED': 'bg-yellow-100 text-yellow-800',
  'CONTACTED': 'bg-orange-100 text-orange-800',
  'IN_CONVERSATION': 'bg-green-100 text-green-800',
  'ON_HOLD': 'bg-red-100 text-red-800',
  'ARCHIVED': 'bg-gray-100 text-gray-600',
  'CONVERTED_TO_DEAL': 'bg-purple-100 text-purple-800'
};

const statusLabels: Record<TargetStatus, string> = {
  'IDENTIFIED': 'Identificado',
  'RESEARCHING': 'Investigando',
  'OUTREACH_PLANNED': 'Contacto Planificado',
  'CONTACTED': 'Contactado',
  'IN_CONVERSATION': 'En Conversación',
  'ON_HOLD': 'En Pausa',
  'ARCHIVED': 'Archivado',
  'CONVERTED_TO_DEAL': 'Convertido a Deal'
};

export const TargetCompaniesTable = () => {
  const { targetCompanies, loading, updateStatus, deleteTargetCompany } = useTargetCompanies();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [selectedTarget, setSelectedTarget] = useState<TargetCompany | null>(null);
  const [editTarget, setEditTarget] = useState<TargetCompany | null>(null);
  const [convertTarget, setConvertTarget] = useState<TargetCompany | null>(null);

  // Filter logic
  const filteredTargets = targetCompanies.filter(target => {
    const matchesSearch = target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || target.status === statusFilter;
    const matchesIndustry = industryFilter === "all" || target.industry === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = Array.from(new Set(targetCompanies.map(t => t.industry).filter(Boolean)));

  const handleStatusChange = async (targetId: string, newStatus: TargetStatus) => {
    await updateStatus(targetId, newStatus);
  };

  const handleDelete = async (targetId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta empresa objetivo?')) {
      await deleteTargetCompany(targetId);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry!}>{industry}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fit Score</TableHead>
              <TableHead>Contactos</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTargets.map((target) => (
              <TableRow key={target.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell onClick={() => setSelectedTarget(target)}>
                  <div>
                    <div className="font-medium">{target.name}</div>
                    {target.website && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {target.website}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={() => setSelectedTarget(target)}>
                  {target.industry || '-'}
                </TableCell>
                <TableCell onClick={() => setSelectedTarget(target)}>
                  <Badge className={statusColors[target.status]}>
                    {statusLabels[target.status]}
                  </Badge>
                </TableCell>
                <TableCell onClick={() => setSelectedTarget(target)}>
                  {target.fit_score ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      {target.fit_score}/5
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell onClick={() => setSelectedTarget(target)}>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-gray-400" />
                    {target.contacts?.length || 0}
                  </div>
                </TableCell>
                <TableCell onClick={() => setSelectedTarget(target)}>
                  {target.revenue ? `€${(target.revenue / 1000000).toFixed(1)}M` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setEditTarget(target)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedTarget(target)}>
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setConvertTarget(target)}>
                        Convertir a Operación
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(target.id)}
                        className="text-red-600"
                      >
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

      {filteredTargets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron empresas objetivo con los filtros aplicados.
        </div>
      )}

      {/* Dialogs */}
      {selectedTarget && (
        <TargetCompanyDetailsDialog
          target={selectedTarget}
          open={!!selectedTarget}
          onOpenChange={() => setSelectedTarget(null)}
        />
      )}

      {editTarget && (
        <EditTargetCompanyDialog
          target={editTarget}
          open={!!editTarget}
          onOpenChange={() => setEditTarget(null)}
        />
      )}

      {convertTarget && (
        <ConvertToOperationDialog
          target={convertTarget}
          open={!!convertTarget}
          onOpenChange={() => setConvertTarget(null)}
        />
      )}
    </div>
  );
};
