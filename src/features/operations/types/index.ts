/**
 * Operations Types
 * 
 * All types related to M&A operations and transactions
 */

// Core operation interfaces
export interface Operation {
  id: string;
  company_name: string;
  project_name?: string;
  sector: string;
  operation_type: "merger" | "sale" | "partial_sale" | "buy_mandate";
  amount: number;
  currency: string;
  date: string;
  buyer?: string;
  seller?: string;
  status: "available" | "pending_review" | "approved" | "rejected" | "in_process" | "sold" | "withdrawn";
  description: string;
  location: string;
  contact_email?: string;
  contact_phone?: string;
  revenue?: number;
  ebitda?: number;
  annual_growth_rate?: number;
  manager_id?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    position?: string;
    photo?: string;
  };
  created_by?: string;
  created_at: string;
  updated_at: string;
  cif?: string;
  teaser_url?: string;
  highlighted?: boolean;
  rod_order?: number;
}

// Operation data interfaces for forms
export interface CreateOperationData {
  company_name: string;
  project_name?: string;
  cif?: string;
  sector: string;
  operation_type: Operation['operation_type'];
  amount: number;
  revenue?: number;
  ebitda?: number;
  currency: string;
  date: string;
  buyer?: string;
  seller?: string;
  status: Operation['status'];
  description?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  annual_growth_rate?: number;
}

export interface BulkOperationData extends CreateOperationData {
  // All fields from CreateOperationData are available for bulk operations
}

// Filter state for operations
export interface OperationFilters {
  search: string;
  sector: string;
  operationType: string;
  location: string;
  amountRange: [number, number];
  revenueRange: [number, number];
  growthRate: number;
  dateRange: string;
  status: string;
}