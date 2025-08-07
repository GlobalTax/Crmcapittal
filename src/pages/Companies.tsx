
import { useState, useEffect } from "react";
import { UltraDenseCompaniesTable } from "@/components/companies/UltraDenseCompaniesTable";
import { CompaniesInlineStats } from "@/components/companies/CompaniesInlineStats";
import { SmartFilterChips } from "@/components/companies/SmartFilterChips";
import { CompanyDetailModal } from "@/components/companies/CompanyDetailModal";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { EditCompanyDialog } from "@/components/companies/EditCompanyDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/Company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    updateCompany, 
    deleteCompany,
    isCreating,
    isUpdating,
    isDeleting,
    useCompanyStats
  } = useCompanies({ 
    page: 1, 
    limit: 100, // Show more companies in dense view
    searchTerm, 
    statusFilter: activeFilter === 'all' ? 'all' : activeFilter, 
    typeFilter: 'all'
  });

  const { data: stats, isLoading: statsLoading } = useCompanyStats();

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
  };

  const handleUpdateCompany = (companyId: string, companyData: any) => {
    updateCompany({ id: companyId, ...companyData });
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
      deleteCompany(companyId);
    }
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailModalOpen(true);
  };

  const handleStatClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleRemoveChip = (chip: string) => {
    setActiveChips(activeChips.filter(c => c !== chip));
  };

  const handleCreateDeal = (company: Company) => {
    // TODO: Implement create deal for company
    console.log('Create deal for:', company.name);
  };

  const handleCreateContact = (company: Company) => {
    // TODO: Implement create contact for company
    console.log('Create contact for:', company.name);
  };

  const handleViewEinforma = (company: Company) => {
    // TODO: Implement eInforma view
    console.log('View eInforma for:', company.name);
  };

  return (
    <div className="space-y-6">
      {/* Header Minimalista */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
        
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* New Company Button */}
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            Nueva Empresa
          </Button>
        </div>
      </div>

      {/* Stats Inline */}
      <CompaniesInlineStats 
        companies={companies}
        onStatClick={handleStatClick}
      />

      {/* Smart Filter Chips */}
      <SmartFilterChips
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        activeChips={activeChips}
        onRemoveChip={handleRemoveChip}
      />
      
      {/* Ultra Dense Table */}
      <UltraDenseCompaniesTable
        companies={companies}
        onCompanyClick={handleCompanyClick}
        onCreateCompany={() => setIsCreateModalOpen(true)}
        onCreateDeal={handleCreateDeal}
        onCreateContact={handleCreateContact}
        onViewEinforma={handleViewEinforma}
        isLoading={isLoading}
      />

      {/* Company Detail Modal */}
      <CompanyDetailModal
        company={selectedCompany}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />

      {/* Create Company Modal */}
      <CompanyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCompany={createCompany}
        isCreating={isCreating}
      />

      {/* Edit Company Dialog */}
      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          onUpdateCompany={handleUpdateCompany}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
};

export default Companies;
