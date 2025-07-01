
import { useState } from "react";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { CreateCompanyDialog } from "@/components/companies/CreateCompanyDialog";
import { EditCompanyDialog } from "@/components/companies/EditCompanyDialog";
import { CompanyDetailsDialog } from "@/components/companies/CompanyDetailsDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/Company";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";

const Companies = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

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
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <CreateCompanyDialog 
            onCreateCompany={createCompany}
            isCreating={isCreating}
          />
        </div>
      </div>
      
      <CompaniesTable 
        companies={companies}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        stats={stats}
        statsLoading={statsLoading}
        onEditCompany={handleEditCompany}
        onDeleteCompany={handleDeleteCompany}
        onViewCompany={handleViewCompany}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onTypeFilter={handleTypeFilter}
        onPageChange={setPage}
        isLoading={isLoading}
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

      {/* Company Details Dialog */}
      {viewingCompany && (
        <CompanyDetailsDialog
          company={viewingCompany}
          open={!!viewingCompany}
          onOpenChange={(open) => !open && setViewingCompany(null)}
          onEditCompany={(company) => {
            setViewingCompany(null);
            setEditingCompany(company);
          }}
        />
      )}
    </div>
  );
};

export default Companies;
