// Base entity interfaces shared across all domain types

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
}

export interface BusinessInfo {
  company?: string;
  company_id?: string;
  position?: string;
  department?: string;
  industry?: string;
  job_title?: string;
}

export interface AddressInfo {
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  region?: string;
}

export interface SocialLinks {
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  website_url?: string;
}

export interface EntityMetadata {
  tags?: string[];
  notes?: string;
  custom_fields?: Record<string, any>;
  external_id?: string;
  source?: string;
  source_details?: Record<string, any>;
}

export interface ActivityTracking {
  last_activity_date?: string;
  last_contact_date?: string;
  last_email_date?: string;
  last_call_date?: string;
  last_meeting_date?: string;
  activity_count?: number;
  interaction_count?: number;
}

export interface ScoringInfo {
  score?: number;
  score_updated_at?: string;
  engagement_score?: number;
  quality_score?: number;
  lead_score?: number;
}