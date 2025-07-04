
import { useState } from 'react';
import { useNegocios } from "@/hooks/useNegocios";
import { CreateNegocioDialog } from "@/components/negocios/CreateNegocioDialog";
import { NegociosTable } from "@/components/negocios/NegociosTable";
import { NegociosKanban } from "@/components/negocios/NegociosKanban";
import { NegociosViewToggle } from "@/components/negocios/NegociosViewToggle";
import { NegociosStats } from "@/components/negocios/NegociosStats";
import { NegociosHeader } from "@/components/negocios/NegociosHeader";
import { FiltersSection } from "@/components/negocios/filters/FiltersSection";
import { useNegociosFilters } from "@/hooks/negocios/useNegociosFilters";
import { EditNegocioDialog } from "@/components/negocios/EditNegocioDialog";

const Negocios = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [editingNegocio, setEditingNegocio] = useState<any>(null);
  
  const { negocios, loading, error, createNegocio, updateNegocio, deleteNegocio, updateNegocioStage } = useNegocios();
  
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
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
        </div>
        <NegociosViewToggle 
          currentView={viewMode} 
          onViewChange={setViewMode} 
        />
      </div>

      {/* Negocios Content */}
      {viewMode === 'table' ? (
        <NegociosTable 
          negocios={filteredNegocios} 
          onUpdate={updateNegocio}
          onDelete={deleteNegocio}
        />
      ) : (
        <div className="h-[600px]">
          <NegociosKanban
            negocios={filteredNegocios}
            onUpdateStage={updateNegocioStage}
            onEdit={setEditingNegocio}
          />
        </div>
      )}

      {/* Create Negocio Dialog */}
      <CreateNegocioDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(newNegocio) => {
          createNegocio(newNegocio);
          setShowCreateDialog(false);
        }}
      />

      {/* Edit Negocio Dialog */}
      {editingNegocio && (
        <EditNegocioDialog
          negocio={editingNegocio}
          open={true}
          onOpenChange={(open) => !open && setEditingNegocio(null)}
          onSuccess={async (updates) => {
            await updateNegocio(editingNegocio.id, updates);
            setEditingNegocio(null);
          }}
        />
      )}
    </div>
  );
};

export default Negocios;
