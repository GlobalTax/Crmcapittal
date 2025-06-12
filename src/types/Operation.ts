
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
}
