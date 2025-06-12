
export interface Operation {
  id: string;
  company_name: string;
  sector: string;
  operation_type: "acquisition" | "merger" | "sale" | "ipo";
  amount: number;
  currency: string;
  date: string;
  buyer?: string;
  seller?: string;
  status: "available" | "in_process" | "sold" | "withdrawn";
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
  photo_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
