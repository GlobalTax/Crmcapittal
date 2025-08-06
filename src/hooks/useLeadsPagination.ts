import { useState, useMemo } from 'react';
import { Lead } from '@/types/Lead';
import { PaginationConfig } from '@/types/common';

export const useLeadsPagination = (leads: Lead[], pageSize: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationConfig = useMemo<PaginationConfig>(() => {
    const totalItems = leads.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    return {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages
    };
  }, [leads.length, pageSize, currentPage]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return leads.slice(startIndex, endIndex);
  }, [leads, currentPage, pageSize]);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationConfig.totalPages));
    setCurrentPage(validPage);
  };

  const goToNextPage = () => {
    if (currentPage < paginationConfig.totalPages) {
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
    paginatedLeads,
    paginationConfig,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination
  };
};