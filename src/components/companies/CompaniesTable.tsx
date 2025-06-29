
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone,
  Globe,
  Building2,
  Users,
  TrendingUp,
  Eye,
  MapPin,
  Calendar
} from "lucide-react";
import { Company, CompanyStatus, CompanyType, LifecycleStage } from "@/types/Company";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CompaniesTableProps {
  companies: Company[];
  onEditCompany?: (company: Company) => void;
  onDeleteCompany?: (companyId: string) => void;
  onViewCompany?: (company: Company) => void;
  isLoading?: boolean;
}

export const CompaniesTable = ({ 
  companies = [], 
  onEditCompany,
  onDeleteCompany,
  onViewCompany,
  isLoading 
}: CompaniesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<CompanyStatus | "all">("all");
  const [filterType, setFilterType] = useState<CompanyType | "all">("all");
  const [filterStage, setFilterStage] = useState<LifecycleStage | "all">("all");

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || company.company_status === filterStatus;
      const matchesType = filterType === "all" || company.company_type === filterType;
      const matchesStage = filterStage === "all" || company.lifecycle_stage === filterStage;
      
      return matchesSearch && matchesStatus && matchesType && matchesStage;
    });
  }, [companies, searchTerm, filterStatus, filterType, filterStage]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
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
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresas por nombre, dominio, industria o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CompanyStatus | "all")}
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
                onChange={(e) => setFilterType(e.target.value as CompanyType | "all")}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Empresas</p>
                <p className="text-2xl font-semibold text-gray-900">{companies.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-semibold text-green-600">
                  {companies.filter(c => c.company_status === 'cliente').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Target Accounts</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {companies.filter(c => c.is_target_account).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total Deals</p>
                <p className="text-2xl font-semibold text-orange-600">
                  {formatCurrency(companies.reduce((acc, c) => acc + (c.total_deal_value || 0), 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredCompanies.length} empresas
            {searchTerm && ` (filtradas de ${companies.length})`}
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
                  <TableHead>Contactos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
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
                          <div className="text-sm text-gray-500 flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {company.domain || 'Sin dominio'}
                          </div>
                          {company.city && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
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
                    
                    <TableCell>
                      <Badge variant="secondary">
                        {company.contacts_count || 0} contactos
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewCompany?.(company)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditCompany?.(company)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteCompany?.(company.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
          
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron empresas
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 
                  "Intenta con otros términos de búsqueda" : 
                  "Crea tu primera empresa para comenzar"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
