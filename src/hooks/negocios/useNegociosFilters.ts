
import { useState, useMemo } from 'react';
import { Negocio } from "@/types/Negocio";

export const useNegociosFilters = (negocios: Negocio[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [valueRangeFilter, setValueRangeFilter] = useState<string>("all");

  // Get unique owners for filter
  const owners = useMemo(() => 
    [...new Set(negocios.map(negocio => negocio.propietario_negocio).filter(Boolean))], 
    [negocios]
  );

  const filteredNegocios = useMemo(() => {
    return negocios.filter(negocio => {
      const matchesSearch = negocio.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           negocio.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           negocio.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           negocio.sector?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || negocio.stage?.name === statusFilter;
      const matchesPriority = priorityFilter === "all" || negocio.prioridad === priorityFilter;
      const matchesOwner = ownerFilter === "all" || negocio.propietario_negocio === ownerFilter;
      
      let matchesValue = true;
      if (valueRangeFilter !== "all" && negocio.valor_negocio) {
        switch (valueRangeFilter) {
          case "0-100k":
            matchesValue = negocio.valor_negocio <= 100000;
            break;
          case "100k-500k":
            matchesValue = negocio.valor_negocio > 100000 && negocio.valor_negocio <= 500000;
            break;
          case "500k-1M":
            matchesValue = negocio.valor_negocio > 500000 && negocio.valor_negocio <= 1000000;
            break;
          case "1M+":
            matchesValue = negocio.valor_negocio > 1000000;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesOwner && matchesValue;
    });
  }, [negocios, searchTerm, statusFilter, priorityFilter, ownerFilter, valueRangeFilter]);

  return {
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
  };
};
