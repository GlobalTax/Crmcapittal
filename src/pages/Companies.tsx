
import { useState } from "react";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { CreateCompanyDialog } from "@/components/companies/CreateCompanyDialog";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Filter, Download } from "lucide-react";

const Companies = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const handleEditCompany = (company: any) => {
    console.log("Edit company:", company);
    // TODO: Implement edit dialog
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
      deleteCompany(companyId);
    }
  };

  const handleViewCompany = (company: any) => {
    console.log("View company:", company);
    // TODO: Implement company details dialog
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
    </div>
  );
};

export default Companies;
