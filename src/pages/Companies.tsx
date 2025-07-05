
import { useState, useEffect } from "react";
import { RecordTable } from "@/components/companies/RecordTable";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { CompanyDrawer } from "@/components/companies/CompanyDrawer";
import { EditCompanyDialog } from "@/components/companies/EditCompanyDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/Company";
import { Button } from "@/components/ui/button";

const Companies = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    useCompanyStats
  } = useCompanies({ 
    page, 
    limit: 25, 
    searchTerm, 
    statusFilter, 
    typeFilter 
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

  const handleViewCompany = (company: Company) => {
    setViewingCompany(company);
    setIsDrawerOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

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
