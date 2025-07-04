
import { useState, useMemo } from 'react';
import { Operation } from '@/types/Operation';
import { PaginationConfig } from '@/types/common';

export const useOperationsPagination = (operations: Operation[], pageSize: number = 12) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationConfig = useMemo<PaginationConfig>(() => {
    const totalItems = operations.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    return {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages
    };
  }, [operations.length, pageSize, currentPage]);

  const paginatedOperations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return operations.slice(startIndex, endIndex);
  }, [operations, currentPage, pageSize]);

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
    paginatedOperations,
    paginationConfig,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination
  };
};
