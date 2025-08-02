
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RecordTable } from "@/components/companies/RecordTable";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { EditCompanyDialog } from "@/components/companies/EditCompanyDialog";
import { useCompaniesContext } from "@/contexts";
import { Button } from "@/components/ui/button";

const Companies = () => {
  const navigate = useNavigate();
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Get data from context
  const { 
    filteredCompanies: companies,
    loading: isLoading,
    createCompany,
    updateCompany,
    deleteCompany,
    setFilters
  } = useCompaniesContext();

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

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
  };

  const handleUpdateCompany = (companyId: string, companyData: any) => {
    updateCompany(companyId, companyData);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
      deleteCompany(companyId);
    }
  };

  const handleViewCompany = (company: any) => {
    if (company.id) {
      navigate(`/empresas/${company.id}`);
    }
  };

  const handleSearch = (term: string) => {
    // For now, we'll leave search handling to be implemented later
    console.log('Search term:', term);
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
        totalCount={companies.length}
        onRowClick={handleViewCompany}
        onCreateCompany={() => setIsCreateModalOpen(true)}
        onSearch={handleSearch}
        onFilter={() => {}}
        isLoading={isLoading}
      />

      {/* Create Company Modal */}
      <CompanyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCompany={createCompany}
        isCreating={false}
      />

      {/* Edit Company Dialog */}
      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          onUpdateCompany={handleUpdateCompany}
          isUpdating={false}
        />
      )}
    </div>
  );
};

export default Companies;
