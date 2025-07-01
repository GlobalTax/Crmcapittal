
import { useState } from 'react';
import { useNegocios } from "@/hooks/useNegocios";
import { CreateNegocioDialog } from "@/components/negocios/CreateNegocioDialog";
import { NegociosTable } from "@/components/negocios/NegociosTable";
import { NegociosStats } from "@/components/negocios/NegociosStats";
import { NegociosHeader } from "@/components/negocios/NegociosHeader";
import { FiltersSection } from "@/components/negocios/filters/FiltersSection";
import { useNegociosFilters } from "@/hooks/negocios/useNegociosFilters";

const Negocios = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  
  const { negocios, loading, error, createNegocio, updateNegocio, deleteNegocio } = useNegocios();
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    ownerFilter,
    setOwnerFilter,
    valueRangeFilter,
    setValueRangeFilter,
    owners,
    filteredNegocios
  } = useNegociosFilters(negocios);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <NegociosHeader 
        showMetrics={showMetrics}
        setShowMetrics={setShowMetrics}
        setShowCreateDialog={setShowCreateDialog}
      />

      {/* Stats */}
      {showMetrics && <NegociosStats negocios={negocios} />}

      {/* Enhanced Filters */}
      <FiltersSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        ownerFilter={ownerFilter}
        setOwnerFilter={setOwnerFilter}
        valueRangeFilter={valueRangeFilter}
        setValueRangeFilter={setValueRangeFilter}
        owners={owners}
        filteredNegocios={filteredNegocios}
        totalNegocios={negocios.length}
      />

      {/* Negocios Table */}
      <NegociosTable 
        negocios={filteredNegocios} 
        onUpdate={updateNegocio}
        onDelete={deleteNegocio}
      />

      {/* Create Negocio Dialog */}
      <CreateNegocioDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(newNegocio) => {
          createNegocio(newNegocio);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};

export default Negocios;
