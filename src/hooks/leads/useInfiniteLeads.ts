import { useInfiniteQuery } from '@tanstack/react-query';
import { Lead, LeadStatus, LeadStage } from '@/types/Lead';
import { fetchLeadsPage } from '@/services/leadsService';

interface UseInfiniteLeadsOptions {
  pageSize?: number;
  filters?: {
    status?: LeadStatus;
    stage?: LeadStage;
    sector_id?: string;
    owner_id?: string;
  };
}

export function useInfiniteLeads({ pageSize = 20, filters }: UseInfiniteLeadsOptions = {}) {
  const query = useInfiniteQuery({
    queryKey: ['leads', 'infinite', filters, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchLeadsPage({ page: pageParam as number, limit: pageSize, filters });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000, // 1 minuto (agresivo para Leads)
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const items: Lead[] = query.data ? query.data.pages.flatMap((p) => p.items) : [];
  const totalCount = query.data?.pages?.[0]?.totalCount ?? 0;
  const totalPages = query.data?.pages?.[0]?.totalPages ?? 1;

  return {
    items,
    totalCount,
    totalPages,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
