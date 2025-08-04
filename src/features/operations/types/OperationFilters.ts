export interface OperationFilters {
  search?: string;
  sector?: string;
  operation_type?: string;
  status?: string;
  location?: string;
  min_amount?: number;
  max_amount?: number;
  min_revenue?: number;
  max_revenue?: number;
  min_growth_rate?: number;
  max_growth_rate?: number;
  date_from?: string;
  date_to?: string;
  manager_id?: string;
  highlighted?: boolean;
}

export interface FilterState {
  search: string;
  sector: string;
  location: string;
  minAmount: number;
  maxAmount: number;
  minRevenue: number;
  maxRevenue: number;
  minGrowthRate: number;
  maxGrowthRate: number;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status: string;
}