
import { useState, useMemo } from 'react';
import { Deal } from "@/types/Deal";

export const useDealsFilters = (deals: Deal[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dealOwnerFilter, setDealOwnerFilter] = useState<string>("all");
  const [valueRangeFilter, setValueRangeFilter] = useState<string>("all");

  // Get unique deal owners for filter
  const dealOwners = useMemo(() => 
    [...new Set(deals.map(deal => deal.deal_owner).filter(Boolean))], 
    [deals]
  );

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || deal.stage?.name === statusFilter;
      const matchesPriority = priorityFilter === "all" || deal.priority === priorityFilter;
      const matchesOwner = dealOwnerFilter === "all" || deal.deal_owner === dealOwnerFilter;
      
      let matchesValue = true;
      if (valueRangeFilter !== "all" && deal.deal_value) {
        switch (valueRangeFilter) {
          case "0-100k":
            matchesValue = deal.deal_value <= 100000;
            break;
          case "100k-500k":
            matchesValue = deal.deal_value > 100000 && deal.deal_value <= 500000;
            break;
          case "500k-1M":
            matchesValue = deal.deal_value > 500000 && deal.deal_value <= 1000000;
            break;
          case "1M+":
            matchesValue = deal.deal_value > 1000000;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesOwner && matchesValue;
    });
  }, [deals, searchTerm, statusFilter, priorityFilter, dealOwnerFilter, valueRangeFilter]);

  return {
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
  };
};
