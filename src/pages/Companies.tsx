
import { useState, useEffect } from "react";
import { RecordTable } from "@/components/companies/RecordTable";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { CompanyDrawer } from "@/components/companies/CompanyDrawer";
import { EditCompanyDialog } from "@/components/companies/EditCompanyDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/Company";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Companies = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  
  const navigate = useNavigate();

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
    currentPage,
    totalPages,
    isLoading, 
    createCompany, 
    updateCompany, 
    deleteCompany,
    isCreating,
    isUpdating,
    isDeleting,
    useCompanyStats,
    error
  } = useCompanies({ 
    page, 
    limit: 25, 
    searchTerm, 
    statusFilter, 
    typeFilter 
  });

  const { data: stats, isLoading: statsLoading } = useCompanyStats();

  // Add debug logging
  console.log("📊 Companies page state:", {
    companiesCount: companies.length,
    totalCount,
    isLoading,
    isCreating,
    page,
    searchTerm,
    statusFilter,
    typeFilter,
    error
  });

  // Log any errors
  if (error) {
    console.error("❌ Companies fetch error:", error);
  }

  const handleEditCompany = (company: Company) => {
    console.log('✏️ handleEditCompany called with:', company.name);
    setEditingCompany(company);
  };

  const handleUpdateCompany = (companyId: string, companyData: any) => {
    console.log('🔄 Updating company:', companyId);
    updateCompany({ id: companyId, ...companyData });
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
      console.log('🗑️ Deleting company:', companyId);
      deleteCompany(companyId);
    }
  };

  const handleViewCompany = (company: Company) => {
    console.log('🔍 handleViewCompany called with:', company.name, 'ID:', company.id);
    
    // Navigate to dedicated company page instead of using drawer
    navigate(`/empresas/${company.id}`);
  };

  const handleNavigateCompany = (direction: 'prev' | 'next') => {
    let newIndex = currentCompanyIndex;
    if (direction === 'prev' && currentCompanyIndex > 0) {
      newIndex = currentCompanyIndex - 1;
    } else if (direction === 'next' && currentCompanyIndex < companies.length - 1) {
      newIndex = currentCompanyIndex + 1;
    }
    
    if (newIndex !== currentCompanyIndex) {
      setCurrentCompanyIndex(newIndex);
      setViewingCompany(companies[newIndex]);
    }
  };

  const handleSearch = (term: string) => {
    console.log('🔍 Search term changed:', term);
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status: string) => {
    console.log('📊 Status filter changed:', status);
    setStatusFilter(status);
    setPage(1);
  };

  const handleTypeFilter = (type: string) => {
    console.log('🏷️ Type filter changed:', type);
    setTypeFilter(type);
    setPage(1);
  };

  // Show error state if there's an error
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Empresas</h2>
            <p className="text-muted-foreground">
              Gestiona todas las empresas de tu pipeline de ventas.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + New company
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar empresas: {error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Empresas</h2>
          <p className="text-muted-foreground">
            Gestiona todas las empresas de tu pipeline de ventas.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + New company
        </Button>
      </div>
      
      <RecordTable
        companies={companies}
        totalCount={totalCount}
        onRowClick={handleViewCompany}
        onCreateCompany={() => setIsCreateModalOpen(true)}
        onSearch={handleSearch}
        onFilter={() => {}} // Placeholder
        isLoading={isLoading}
      />

      {/* Create Company Modal */}
      <CompanyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCompany={createCompany}
        isCreating={isCreating}
      />

      {/* Company Drawer */}
      <CompanyDrawer
        company={viewingCompany}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setViewingCompany(null);
        }}
        onEdit={(company) => {
          setIsDrawerOpen(false);
          setEditingCompany(company);
        }}
        onDelete={handleDeleteCompany}
        companies={companies}
        currentIndex={currentCompanyIndex}
        onNavigate={handleNavigateCompany}
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
