import { useCallback, useRef } from 'react';
import { requestManager } from '@/services/requestManager';

export interface BatchedQuery {
  key: string;
  fn: () => Promise<any>;
  priority?: 'high' | 'medium' | 'low';
}

export const useBatchedQueries = () => {
  const batchRef = useRef<BatchedQuery[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const addToBatch = useCallback((query: BatchedQuery) => {
    batchRef.current.push(query);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Execute batch after 50ms of inactivity
    timeoutRef.current = setTimeout(() => {
      if (batchRef.current.length > 0) {
        executeBatch();
      }
    }, 50);
  }, []);

  const executeBatch = useCallback(async () => {
    const batch = [...batchRef.current];
    batchRef.current = [];

    if (batch.length === 0) return;

    // Group by priority
    const highPriority = batch.filter(q => q.priority === 'high');
    const mediumPriority = batch.filter(q => q.priority === 'medium');
    const lowPriority = batch.filter(q => q.priority === 'low');

    // Execute in order of priority
    const promises = [
      ...highPriority.map(q => requestManager.request({
        key: q.key,
        priority: 'high',
        fn: q.fn,
        cacheTtl: 120000
      })),
      ...mediumPriority.map(q => requestManager.request({
        key: q.key,
        priority: 'medium',
        fn: q.fn,
        cacheTtl: 300000
      })),
      ...lowPriority.map(q => requestManager.request({
        key: q.key,
        priority: 'low',
        fn: q.fn,
        cacheTtl: 600000
      }))
    ];

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Batch execution error:', error);
    }
  }, []);

  return { addToBatch };
};