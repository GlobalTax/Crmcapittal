import { Operation } from '@/types/Operation';

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