
import { useState } from "react";
import { Company } from "@/types/Company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Plus } from "lucide-react";

interface SociedadesTableProps {
  sociedades: Company[];
  totalCount: number;
  onRowClick: (sociedad: Company) => void;
  onCreateSociedad: () => void;
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export function SociedadesTable({
  sociedades,
  totalCount,
  onRowClick,
  onCreateSociedad,
  onSearch,
  isLoading
}: SociedadesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  console.log("📊 [SociedadesTable] Renderizando con datos:", {
    count: sociedades.length,
    totalCount,
    isLoading
  });

  const handleSearch = (value: string) => {
    console.log("🔍 [SociedadesTable] Búsqueda:", value);
    setSearchTerm(value);
    onSearch(value);
  };

  const handleRowClick = (sociedad: Company) => {
    console.log("👆 [SociedadesTable] Click en fila:", {
      id: sociedad.id,
      name: sociedad.name
    });
    onRowClick(sociedad);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'activa': { variant: 'default', label: 'Activa' },
      'inactiva': { variant: 'secondary', label: 'Inactiva' },
      'prospecto': { variant: 'outline', label: 'Prospecto' },
      'cliente': { variant: 'default', label: 'Cliente' },
      'perdida': { variant: 'destructive', label: 'Perdida' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'prospect': { variant: 'outline', label: 'Prospecto' },
      'cliente': { variant: 'default', label: 'Cliente' },
      'partner': { variant: 'secondary', label: 'Partner' },
      'franquicia': { variant: 'default', label: 'Franquicia' },
      'competidor': { variant: 'destructive', label: 'Competidor' },
      'target': { variant: 'default', label: 'Target' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: 'outline', label: type };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="h-10 bg-muted rounded w-32 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sociedades</h2>
          <p className="text-muted-foreground">
            Gestiona el listado completo de sociedades ({totalCount} total)
          </p>
        </div>
        <Button onClick={onCreateSociedad} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Sociedad
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sociedades..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="activa">Active</SelectItem>
            <SelectItem value="inactiva">Inactive</SelectItem>
            <SelectItem value="prospecto">Prospecto</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="prospect">Prospecto</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="target">Target</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de sociedades */}
      <div className="space-y-4">
        {sociedades.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron sociedades</h3>
              <p className="text-muted-foreground mb-4">Comienza creando tu primera sociedad</p>
              <Button onClick={onCreateSociedad}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Sociedad
              </Button>
            </CardContent>
          </Card>
        ) : (
          sociedades.map((sociedad) => (
            <Card 
              key={sociedad.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleRowClick(sociedad)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <h3 className="font-semibold text-lg">{sociedad.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      {sociedad.domain && (
                        <span>🌐 {sociedad.domain}</span>
                      )}
                      {sociedad.industry && (
                        <span>🏭 {sociedad.industry}</span>
                      )}
                      {sociedad.city && (
                        <span>📍 {sociedad.city}</span>
                      )}
                      {sociedad.annual_revenue && (
                        <span>💰 {sociedad.annual_revenue.toLocaleString()}€</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {getStatusBadge(sociedad.company_status)}
                    {getTypeBadge(sociedad.company_type)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
