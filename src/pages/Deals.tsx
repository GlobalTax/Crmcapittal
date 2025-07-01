
import { useState } from 'react';
import { useDeals } from "@/hooks/useDeals";
import { CreateDealDialog } from "@/components/deals/CreateDealDialog";
import { DealsTable } from "@/components/deals/DealsTable";
import { DealsStats } from "@/components/deals/DealsStats";
import { DealsHeader } from "@/components/deals/DealsHeader";
import { FiltersSection } from "@/components/deals/filters/FiltersSection";
import { useDealsFilters } from "@/hooks/deals/useDealsFilters";

const Deals = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  
  const { deals, loading, error, createDeal, updateDeal, deleteDeal } = useDeals();
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    dealOwnerFilter,
    setDealOwnerFilter,
    valueRangeFilter,
    setValueRangeFilter,
    dealOwners,
    filteredDeals
  } = useDealsFilters(deals);

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
      <DealsHeader 
        showMetrics={showMetrics}
        setShowMetrics={setShowMetrics}
        setShowCreateDialog={setShowCreateDialog}
      />

      {/* Stats */}
      {showMetrics && <DealsStats deals={deals} />}

      {/* Enhanced Filters */}
      <FiltersSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        dealOwnerFilter={dealOwnerFilter}
        setDealOwnerFilter={setDealOwnerFilter}
        valueRangeFilter={valueRangeFilter}
        setValueRangeFilter={setValueRangeFilter}
        dealOwners={dealOwners}
        filteredDeals={filteredDeals}
        totalDeals={deals.length}
      />

      {/* Deals Table */}
      <DealsTable 
        deals={filteredDeals} 
        onUpdate={updateDeal}
        onDelete={deleteDeal}
      />

      {/* Create Deal Dialog */}
      <CreateDealDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(newDeal) => {
          createDeal(newDeal);
          setShowCreateDialog(false);
        }}
        pipelineId="DEAL"
      />
    </div>
  );
};

export default Deals;
