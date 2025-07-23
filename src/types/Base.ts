
/**
 * Base interfaces for consistent data modeling across the application
 */

// Base entity interface that all entities should extend
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Base contact information shared across entities
export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
}

// Business information shared across entities
export interface BusinessInfo {
  company?: string;
  company_id?: string;
  position?: string;
  industry?: string;
}

// Address information
export interface AddressInfo {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

// Social media links
export interface SocialLinks {
  linkedin_url?: string;
  website_url?: string;
  twitter_url?: string;
  facebook_url?: string;
}

// Metadata for tracking and analytics
export interface EntityMetadata {
  source_table?: string;
  external_id?: string;
  tags?: string[];
  notes?: string;
}

// Activity tracking
export interface ActivityTracking {
  first_contact_date?: string;
  last_contact_date?: string;
  last_activity_date?: string;
  next_follow_up_date?: string;
}

// Scoring and engagement
export interface ScoringInfo {
  lead_score?: number;
  engagement_score?: number;
  engagement_level?: number;
}
