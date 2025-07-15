export interface Campaign {
  id: string;
  opportunity_ids: string[];
  audience: string;
  subject: string;
  html_body: string;
  sent_at: string;
  created_by?: string;
  created_at: string;
}

export interface CreateCampaignData {
  opportunity_ids: string[];
  audience: string;
  subject: string;
  html_body: string;
}