
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SociedadesTable } from "@/components/sociedades/SociedadesTable";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { useSociedades } from "@/hooks/useSociedades";
import { Company } from "@/types/Company";

const Sociedades = () => {
  console.log("🏢 [Sociedades] Componente iniciado");
  
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { 
    sociedades, 
    totalCount,
    currentPage,
    totalPages,
    isLoading, 
    createSociedad, 
    isCreating,
  } = useSociedades({ 
    page, 
    limit: 25, 
    searchTerm, 
    statusFilter, 
    typeFilter 
  });

  console.log("📊 [Sociedades] Estado actual:", {
    sociedadesCount: sociedades.length,
    totalCount,
    currentPage,
    isLoading,
    searchTerm
  });

  const handleViewSociedad = (sociedad: Company) => {
    console.log("🔍 [Sociedades] handleViewSociedad llamado:", {
      id: sociedad.id,
      name: sociedad.name,
      hasId: !!sociedad.id,
      idType: typeof sociedad.id
    });
    
    if (!sociedad.id) {
      console.error("❌ [Sociedades] ID de sociedad faltante:", sociedad);
      alert("Error: ID de sociedad no válido");
      return;
    }

    const targetPath = `/sociedades/${sociedad.id}`;
    console.log("🚀 [Sociedades] Navegando a:", targetPath);
    
    try {
      navigate(targetPath);
      console.log("✅ [Sociedades] Navegación iniciada correctamente");
    } catch (error) {
      console.error("❌ [Sociedades] Error de navegación:", error);
      alert("Error al navegar a la página de la sociedad");
    }
  };

  const handleSearch = (term: string) => {
    console.log("🔍 [Sociedades] Búsqueda:", term);
    setSearchTerm(term);
    setPage(1);
  };

  const handleCreateSociedad = () => {
    console.log("➕ [Sociedades] Abriendo modal de creación");
    setIsCreateModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <SociedadesTable
        sociedades={sociedades}
        totalCount={totalCount}
        onRowClick={handleViewSociedad}
        onCreateSociedad={handleCreateSociedad}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Modal de creación */}
      <CompanyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCompany={createSociedad}
        isCreating={isCreating}
      />
    </div>
  );
};

export default Sociedades;
