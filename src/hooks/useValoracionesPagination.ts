import { useState, useMemo } from 'react';
import type { Valoracion } from '@/types/Valoracion';

export const useValoracionesPagination = (valoraciones: Valoracion[], pageSize: number = 12) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(valoraciones.length / pageSize);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return valoraciones.slice(startIndex, startIndex + pageSize);
  }, [valoraciones, currentPage, pageSize]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    totalItems: valoraciones.length,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
};