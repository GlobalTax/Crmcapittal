import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { UnifiedCard } from "@/components/ui/unified-card";
import AdvancedTable from "@/components/ui/minimal/AdvancedTable";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/Company";
import { Building2, TrendingUp, Target, Euro, Plus } from "lucide-react";

export default function MinimalCompanies() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { 
    companies, 
    totalCount,
    currentPage,
    totalPages,
    isLoading, 
    createCompany, 
    updateCompany, 
    deleteCompany,
    isCreating,
    useCompanyStats
  } = useCompanies({ 
    page, 
    limit: 25, 
    searchTerm, 
    statusFilter, 
    typeFilter 
  });

  const { data: stats } = useCompanyStats();

  // Definir columnas para la tabla de empresas
  const companyColumns = [
    { id: 'name', label: 'Empresa', visible: true },
    { id: 'industry', label: 'Sector', visible: true },
    { id: 'company_size', label: 'Tamaño', visible: true },
    { id: 'company_status', label: 'Estado', visible: true },
    { id: 'company_type', label: 'Tipo', visible: true },
    { id: 'city', label: 'Ciudad', visible: true },
    { id: 'lead_score', label: 'Puntuación', visible: true },
    { id: 'actions', label: 'Acciones', visible: true }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      activa: { label: "Activa", color: "green" as const },
      inactiva: { label: "Inactiva", color: "gray" as const },
      prospecto: { label: "Prospecto", color: "blue" as const },
      cliente: { label: "Cliente", color: "green" as const },
      perdida: { label: "Perdida", color: "red" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.prospecto;
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      prospect: { label: "Prospecto", color: "blue" as const },
      cliente: { label: "Cliente", color: "green" as const },
      partner: { label: "Socio", color: "blue" as const },
      franquicia: { label: "Franquicia", color: "yellow" as const },
      competidor: { label: "Competidor", color: "red" as const }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.prospect;
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.company_status === statusFilter;
    const matchesType = typeFilter === 'all' || company.company_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Preparar datos para la tabla avanzada
  const tableData = filteredCompanies.map(company => ({
    id: company.id,
    name: <div className="font-medium">{company.name}</div>,
    industry: company.industry || 'N/A',
    company_size: company.company_size || 'N/A',
    company_status: getStatusBadge(company.company_status),
    company_type: getTypeBadge(company.company_type),
    city: company.city || 'N/A',
    lead_score: company.lead_score || 0,
    actions: (
      <div className="flex gap-2 justify-end">
        <button 
          onClick={() => navigate(`/empresas/${company.id}`)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Ver
        </button>
      </div>
    )
  }));

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleViewCompany = (company: Company) => {
    navigate(`/empresas/${company.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Page Header */}
      <PageHeader
        title="Empresas"
        description="Gestiona tu cartera de empresas y prospectos"
        badge={{ text: `${totalCount} empresas`, variant: 'secondary' }}
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Empresa
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Empresas"
          value={totalCount.toLocaleString()}
          description="En tu cartera"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatsCard
          title="Clientes"
          value={(stats?.clientCompanies || 0).toLocaleString()}
          description="Empresas activas"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Target Accounts"
          value={(stats?.targetAccounts || 0).toLocaleString()}
          description="Cuentas objetivo"
          icon={<Target className="h-5 w-5" />}
        />
        <StatsCard
          title="Valor Total"
          value={`€${(stats?.totalDealsValue || 0).toLocaleString()}`}
          description="Valor de deals"
          icon={<Euro className="h-5 w-5" />}
        />
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="prospecto">Prospecto</option>
              <option value="cliente">Cliente</option>
              <option value="perdida">Perdida</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos los tipos</option>
              <option value="prospect">Prospecto</option>
              <option value="cliente">Cliente</option>
              <option value="partner">Socio</option>
              <option value="franquicia">Franquicia</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Companies Table */}
      <UnifiedCard 
        title={`${filteredCompanies.length} empresas${searchTerm ? ` (filtradas de ${companies.length})` : ''}`}
        className="p-0"
      >
        <div className="p-6">
          <AdvancedTable
            data={tableData}
            columns={companyColumns}
            onRowClick={(row) => {
              navigate(`/companies/${row.id}`);
            }}
            className=""
          />
        </div>
      </UnifiedCard>

      {/* Create Company Modal */}
      <CompanyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCompany={createCompany}
        isCreating={isCreating}
      />
    </div>
  );
}