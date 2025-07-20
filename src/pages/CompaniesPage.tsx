
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { RecordTable } from "@/components/companies/RecordTable";
import { CompaniesGrid } from "@/components/companies/CompaniesGrid";
import { useCompanies } from "@/hooks/useCompanies";
import { Building2, Users, Target, TrendingUp, Search, Grid3X3, List, Filter, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Keyboard shortcut for new company
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          const activeElement = document.activeElement;
          if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            setIsCreateModalOpen(true);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { 
    companies, 
    totalCount,
    isLoading, 
    createCompany,
    isCreating,
    useCompanyStats
  } = useCompanies({ 
    page: 1, 
    limit: 1000, 
    searchTerm, 
    statusFilter, 
    typeFilter 
  });

  const { data: stats, isLoading: statsLoading } = useCompanyStats();

  const handleCompanyClick = (company: any) => {
    navigate(`/empresas/${company.id}`);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const activeCompanies = companies.filter(c => c.company_status === 'cliente' || c.company_status === 'activa').length;
  const newCompanies = companies.filter(c => {
    const createdDate = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  // Get unique sectors for sector distribution
  const sectorDistribution = companies.reduce((acc: Record<string, number>, company) => {
    const sector = company.sector || company.industry || 'Sin sector';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {});
  const topSector = Object.entries(sectorDistribution).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Empresas"
        description="Gestiona tu cartera completa de empresas y clientes"
        badge={{
          text: `${totalCount} empresas`,
          variant: 'secondary'
        }}
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva empresa
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Empresas"
          value={totalCount}
          description="En la base de datos"
          icon={<Building2 className="h-6 w-6" />}
          trend={{
            value: newCompanies,
            label: "nuevas este mes",
            direction: newCompanies > 0 ? 'up' : 'neutral'
          }}
        />
        
        <StatsCard
          title="Empresas Activas"
          value={activeCompanies}
          description={`${Math.round((activeCompanies / totalCount) * 100)}% del total`}
          icon={<Users className="h-6 w-6" />}
        />
        
        <StatsCard
          title="Sector Principal"
          value={topSector?.[1] || 0}
          description={topSector?.[0] || 'Sin datos'}
          icon={<Target className="h-6 w-6" />}
        />
        
        <StatsCard
          title="Nuevas (30d)"
          value={newCompanies}
          description="Empresas añadidas"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{
            value: 12,
            label: "vs mes anterior",
            direction: 'up'
          }}
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Estado
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Todos los estados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('cliente')}>
                Clientes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('prospecto')}>
                Prospectos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('activa')}>
                Activas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Tipo
                {typeFilter !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    1
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                Todos los tipos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('cliente')}>
                Cliente
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('prospect')}>
                Prospecto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('partner')}>
                Partner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Companies List/Grid */}
      {view === 'list' ? (
        <RecordTable
          companies={companies}
          totalCount={totalCount}
          onRowClick={handleCompanyClick}
          onCreateCompany={() => setIsCreateModalOpen(true)}
          onSearch={handleSearch}
          onFilter={() => {}}
          isLoading={isLoading}
        />
      ) : (
        <CompaniesGrid
          companies={companies}
          onCompanyClick={handleCompanyClick}
          isLoading={isLoading}
        />
      )}

      {/* Create Company Modal */}
      <CompanyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCompany={createCompany}
        isCreating={isCreating}
      />
    </div>
  );
};

export default CompaniesPage;
