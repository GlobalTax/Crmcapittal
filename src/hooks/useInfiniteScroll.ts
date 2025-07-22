
import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  threshold = 0.8,
  rootMargin = '100px'
}: UseInfiniteScrollOptions) {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isFetching) return;
    
    logger.debug('Infinite scroll: Loading more items');
    setIsFetching(true);
    
    // El componente padre debe manejar la carga real
    setTimeout(() => setIsFetching(false), 100);
  }, [hasMore, isLoading, isFetching]);
  
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin
      }
    );
    
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, threshold, rootMargin]);
  
  return {
    loadMoreRef,
    isFetching,
    loadMore
  };
}
