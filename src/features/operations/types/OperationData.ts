import { Operation } from './Operation';

export interface CreateOperationData extends Omit<Operation, 'id' | 'created_at' | 'updated_at'> {
  // Required fields for creation
  company_name: string;
  sector: string;
  operation_type: "merger" | "sale" | "partial_sale" | "buy_mandate";
  amount: number;
  currency: string;
  date: string;
  status: "available" | "pending_review" | "approved" | "rejected" | "in_process" | "sold" | "withdrawn";
  description: string;
  location: string;
}

export interface BulkOperationData {
  operations: CreateOperationData[];
  validateData?: boolean;
}

export interface UpdateOperationData extends Partial<CreateOperationData> {
  id: string;
}