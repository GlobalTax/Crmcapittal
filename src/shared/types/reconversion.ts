/**
 * Reconversion Types
 * 
 * Specific types for reconversion data to replace 'any' usage
 */

export type ReconversionPriority = 'critica' | 'alta' | 'media' | 'baja';
export type ReconversionStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type ReconversionSubfase = 'prospecting' | 'nda' | 'loi' | 'dd' | 'signing';

export interface ReconversionData {
  id: string;
  company_name: string;
  contact_name: string;
  subfase: ReconversionSubfase;
  prioridad: ReconversionPriority;
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  target_sectors?: string[];
  fecha_objetivo_cierre?: string;
  matched_targets_count: number;
  status: ReconversionStatus;
  created_at: string;
  updated_at: string;
  assigned_to?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface ReconversionTableRow {
  id: string;
  company_name: string;
  contact_name: string;
  subfase: ReconversionSubfase;
  prioridad: ReconversionPriority;
  investment_capacity: number;
  target_sectors: string[];
  fecha_objetivo_cierre: Date | null;
  matched_targets_count: number;
  status: ReconversionStatus;
  created_at: Date;
}

export interface ReconversionKanbanItem {
  id: string;
  company_name: string;
  contact_name: string;
  subfase: ReconversionSubfase;
  prioridad: ReconversionPriority;
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  target_sectors?: string[];
  fecha_objetivo_cierre?: string;
  matched_targets_count: number;
}

export interface ReconversionFilters {
  search: string;
  status: ReconversionStatus | 'all';
  priority: ReconversionPriority | 'all';
  subfase: ReconversionSubfase | 'all';
  assignedTo: string;
  dateRange?: { from: Date; to: Date };
}

export interface ReconversionStats {
  total: number;
  byStatus: Record<ReconversionStatus, number>;
  byPriority: Record<ReconversionPriority, number>;
  bySubfase: Record<ReconversionSubfase, number>;
  totalInvestmentCapacity: number;
  averageInvestmentCapacity: number;
}