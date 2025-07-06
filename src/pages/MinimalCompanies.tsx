import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import AdvancedTable from "@/components/ui/minimal/AdvancedTable";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/Company";

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
          onClick={() => navigate(`/companies/${company.id}`)}
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
    navigate(`/companies/${company.id}`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas - Minimal</h1>
          <p className="text-gray-600 mt-1">Gestiona todas las empresas de tu pipeline</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          Nueva Empresa
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="prospect">Prospecto</option>
              <option value="cliente">Cliente</option>
              <option value="partner">Socio</option>
              <option value="franquicia">Franquicia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Total Empresas</span>
          <span className="text-3xl font-bold mt-2 block">{totalCount}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Clientes</span>
          <span className="text-3xl font-bold mt-2 block text-green-600">
            {stats?.clientCompanies || 0}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Target Accounts</span>
          <span className="text-3xl font-bold mt-2 block text-blue-600">
            {stats?.targetAccounts || 0}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border">
          <span className="text-gray-500 text-sm">Valor Total</span>
          <span className="text-3xl font-bold mt-2 block">
            €{stats?.totalDealsValue?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            {filteredCompanies.length} empresas
            {searchTerm && ` (filtradas de ${companies.length})`}
          </h3>
        </div>
        <div className="p-4">
          <AdvancedTable
            data={tableData}
            columns={companyColumns}
            onRowClick={(row) => {
              navigate(`/companies/${row.id}`);
            }}
            className=""
          />
        </div>
      </div>

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