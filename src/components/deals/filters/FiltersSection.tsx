
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download } from "lucide-react";
import { Deal } from "@/types/Deal";

interface FiltersSectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  dealOwnerFilter: string;
  setDealOwnerFilter: (value: string) => void;
  valueRangeFilter: string;
  setValueRangeFilter: (value: string) => void;
  dealOwners: string[];
  filteredDeals: Deal[];
  totalDeals: number;
}

export const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  dealOwnerFilter,
  setDealOwnerFilter,
  valueRangeFilter,
  setValueRangeFilter,
  dealOwners,
  filteredDeals,
  totalDeals
}: FiltersSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros y Búsqueda Avanzada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar negocios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              <SelectItem value="Lead Valoración">Lead Valoración</SelectItem>
              <SelectItem value="Lead Importante">Lead Importante</SelectItem>
              <SelectItem value="Enviado 1r Contacto">Enviado 1r Contacto</SelectItem>
              <SelectItem value="En Contacto">En Contacto</SelectItem>
              <SelectItem value="PSI Enviada">PSI Enviada</SelectItem>
              <SelectItem value="Solicitando Info">Solicitando Info</SelectItem>
              <SelectItem value="Realizando Valoración">Realizando Valoración</SelectItem>
              <SelectItem value="Valoración Entregada">Valoración Entregada</SelectItem>
              <SelectItem value="Lead CV">Lead CV</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dealOwnerFilter} onValueChange={setDealOwnerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Propietario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los propietarios</SelectItem>
              {dealOwners.map((owner) => (
                <SelectItem key={owner} value={owner!}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={valueRangeFilter} onValueChange={setValueRangeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Rango de valor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los valores</SelectItem>
              <SelectItem value="0-100k">0 - 100K €</SelectItem>
              <SelectItem value="100k-500k">100K - 500K €</SelectItem>
              <SelectItem value="500k-1M">500K - 1M €</SelectItem>
              <SelectItem value="1M+">1M+ €</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredDeals.length} de {totalDeals} negocios
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              Acciones en Masa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
