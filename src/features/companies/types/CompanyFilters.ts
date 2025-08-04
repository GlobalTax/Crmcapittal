export interface CompanyFilters {
  sector?: string;
  location?: string;
  revenueRange?: [number, number];
  employeeRange?: [number, number];
  companyType?: string;
  status?: string;
  search?: string;
  isTargetAccount?: boolean;
}

export interface CompanyFilterState {
  sector: string;
  location: string;
  revenueRange: [number, number];
  employeeRange: [number, number];
  companyType: string;
  status: string;
}