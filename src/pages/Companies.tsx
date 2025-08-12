
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RecordTable } from "@/components/companies/RecordTable";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { EditCompanyDialog } from "@/components/companies/EditCompanyDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/Company";
import { Button } from "@/components/ui/button";

const Companies = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
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
    if (company.id) {
      navigate(`/empresas/${company.id}`);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
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
      <div className="mb-6 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Nueva Empresa
          </Button>
        </div>
      </div>
      
      <RecordTable
        companies={companies}
        totalCount={totalCount}
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
