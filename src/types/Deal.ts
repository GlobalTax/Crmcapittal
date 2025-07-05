export interface Deal {
  id: string;
  title: string;
  amount?: number;
  stage: string;
  probability: number;
  companyId?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  company?: {
    id: string;
    name: string;
    industry?: string;
    website?: string;
  };
  
  owner?: {
    id: string;
    name: string;
    email?: string;
  };
  
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    position?: string;
    company?: string;
  };
}

export type DealStage = 'Lead' | 'In Progress' | 'Won' | 'Lost';

export interface CreateDealData {
  title: string;
  amount?: number;
  stage: DealStage;
  probability?: number;
  companyId?: string;
  ownerId: string;
  associatedPeople?: string[];
}