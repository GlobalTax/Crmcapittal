
import { useState, useMemo } from "react";
import { Operation } from "@/types/Operation";

export const useAdminTableFilters = (operations: Operation[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSector, setFilterSector] = useState<string>("all");

  // Filter operations based on search and filters
  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      const matchesSearch = operation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           operation.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           operation.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           operation.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || operation.status === filterStatus;
      const matchesSector = filterSector === "all" || operation.sector === filterSector;
      
      return matchesSearch && matchesStatus && matchesSector;
    });
  }, [operations, searchTerm, filterStatus, filterSector]);

  // Get unique sectors for filter dropdown
  const uniqueSectors = useMemo(() => {
    return Array.from(new Set(operations.map(op => op.sector)));
  }, [operations]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterSector,
    setFilterSector,
    filteredOperations,
    uniqueSectors
  };
};
