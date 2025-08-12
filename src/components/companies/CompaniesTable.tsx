
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Company, CompanyStatus, CompanyType } from "@/types/Company";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RevealSection } from '@/components/ui/RevealSection';

interface CompaniesTableProps {
  companies: Company[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  stats?: {
    totalCompanies: number;
    clientCompanies: number;
    targetAccounts: number;
    totalDealsValue: number;
  };
  statsLoading?: boolean;
  onEditCompany?: (company: Company) => void;
  onDeleteCompany?: (companyId: string) => void;
  onViewCompany?: (company: Company) => void;
  onSearch?: (term: string) => void;
  onStatusFilter?: (status: string) => void;
  onTypeFilter?: (type: string) => void;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export const CompaniesTable = ({ 
  companies = [], 
  totalCount,
  currentPage,
  totalPages,
  stats,
  statsLoading,
  onEditCompany,
  onDeleteCompany,
  onViewCompany,
  onSearch,
  onStatusFilter,
  onTypeFilter,
  onPageChange,
  isLoading 
}: CompaniesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<CompanyStatus | "all">("all");
  const [filterType, setFilterType] = useState<CompanyType | "all">("all");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleStatusChange = (status: CompanyStatus | "all") => {
    setFilterStatus(status);
    onStatusFilter?.(status);
  };

  const handleTypeChange = (type: CompanyType | "all") => {
    setFilterType(type);
    onTypeFilter?.(type);
  };

  const getStatusBadge = (status: CompanyStatus) => {
    const statusConfig = {
      activa: { label: "Activa", color: "bg-green-100 text-green-800" },
      inactiva: { label: "Inactiva", color: "bg-gray-100 text-gray-800" },
      prospecto: { label: "Prospecto", color: "bg-blue-100 text-blue-800" },
      cliente: { label: "Cliente", color: "bg-purple-100 text-purple-800" },
      perdida: { label: "Perdida", color: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: CompanyType) => {
    const typeConfig = {
      prospect: { label: "Prospecto", color: "bg-blue-100 text-blue-800" },
      cliente: { label: "Cliente", color: "bg-green-100 text-green-800" },
      partner: { label: "Partner", color: "bg-purple-100 text-purple-800" },
      franquicia: { label: "Franquicia", color: "bg-orange-100 text-orange-800" },
      competidor: { label: "Competidor", color: "bg-red-100 text-red-800" }
    };
    
    const config = typeConfig[type];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatsCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading && companies.length === 0) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar empresas por nombre, dominio, industria o ciudad..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value as CompanyStatus | "all")}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
                <option value="prospecto">Prospecto</option>
                <option value="cliente">Cliente</option>
                <option value="perdida">Perdida</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => handleTypeChange(e.target.value as CompanyType | "all")}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="prospect">Prospecto</option>
                <option value="cliente">Cliente</option>
                <option value="partner">Partner</option>
                <option value="franquicia">Franquicia</option>
                <option value="competidor">Competidor</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards (toggle) */}
      <RevealSection storageKey="companies/stats" defaultCollapsed={false} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas" count={4}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Empresas"
            value={stats?.totalCompanies || 0}
            color="text-orange-600"
          />
          <StatsCard
            title="Clientes"
            value={stats?.clientCompanies || 0}
            color="text-green-600"
          />
          <StatsCard
            title="Target Accounts"
            value={stats?.targetAccounts || 0}
            color="text-purple-600"
          />
          <StatsCard
            title="Valor Total Deals"
            value={stats ? formatCurrency(stats.totalDealsValue) : "€0"}
            color="text-orange-600"
          />
        </div>
      </RevealSection>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {totalCount} empresas
            {totalCount > companies.length && ` (mostrando ${companies.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Industria</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Lead Score</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                            {getInitials(company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">
                            {company.domain || 'Sin dominio'}
                          </div>
                          {company.city && (
                            <div className="text-sm text-gray-500">
                              {company.city}, {company.country}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{company.industry}</div>
                        <div className="text-sm text-gray-500">{company.company_size}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(company.company_status)}
                    </TableCell>
                    
                    <TableCell>
                      {getTypeBadge(company.company_type)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center">
                        <div className="text-sm font-medium">{company.lead_score || 0}</div>
                        <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${(company.lead_score || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewCompany?.(company)}>
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditCompany?.(company)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteCompany?.(company.id)}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * 25) + 1} a {Math.min(currentPage * 25, totalCount)} de {totalCount} empresas
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
          
          {companies.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron empresas
              </h3>
              <p className="text-gray-500">
                Intenta con otros términos de búsqueda o crea tu primera empresa
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
