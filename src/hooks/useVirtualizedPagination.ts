
import { useState, useMemo, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface VirtualizedPaginationConfig {
  pageSize: number;
  virtualPageSize?: number; // Para pre-cargar más elementos
  maxCachedPages?: number;
}

export function useVirtualizedPagination<T>(
  data: T[],
  config: VirtualizedPaginationConfig
) {
  const {
    pageSize,
    virtualPageSize = pageSize * 2,
    maxCachedPages = 5
  } = config;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [cachedPages, setCachedPages] = useState<Map<number, T[]>>(new Map());
  
  const totalPages = Math.ceil(data.length / pageSize);
  const totalItems = data.length;
  
  // Datos de la página actual con pre-carga
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + virtualPageSize, data.length);
    
    const pageData = data.slice(startIndex, endIndex);
    
    // Cachear la página
    setCachedPages(prev => {
      const newCache = new Map(prev);
      newCache.set(currentPage, pageData);
      
      // Limpiar cache si excede el límite
      if (newCache.size > maxCachedPages) {
        const oldestPage = Math.min(...Array.from(newCache.keys()));
        newCache.delete(oldestPage);
      }
      
      return newCache;
    });
    
    logger.debug(`Page ${currentPage} data loaded`, {
      startIndex,
      endIndex,
      itemCount: pageData.length,
      cacheSize: cachedPages.size
    });
    
    return pageData.slice(0, pageSize); // Solo mostrar el tamaño real de página
  }, [data, currentPage, pageSize, virtualPageSize, maxCachedPages]);
  
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    
    // Verificar si la página está en cache
    if (cachedPages.has(validPage)) {
      logger.debug(`Using cached data for page ${validPage}`);
    }
    
    setCurrentPage(validPage);
  }, [totalPages, cachedPages]);
  
  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setCachedPages(new Map());
  }, []);
  
  // Pre-cargar páginas adyacentes
  const preloadAdjacentPages = useCallback(() => {
    const pagesToPreload = [currentPage - 1, currentPage + 1].filter(
      page => page >= 1 && page <= totalPages && !cachedPages.has(page)
    );
    
    pagesToPreload.forEach(page => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, data.length);
      const pageData = data.slice(startIndex, endIndex);
      
      setCachedPages(prev => new Map(prev).set(page, pageData));
    });
  }, [currentPage, totalPages, pageSize, data, cachedPages]);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    currentPageData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    preloadAdjacentPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    cacheInfo: {
      size: cachedPages.size,
      pages: Array.from(cachedPages.keys())
    }
  };
}
