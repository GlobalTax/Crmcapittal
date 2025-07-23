/**
 * Centralized type exports for the application
 * This file provides a single entry point for all type definitions
 */

// Base types
export * from './Base';

// Entity types
export * from './Contact';
export * from './Lead';
export * from './Company';
export * from './Operation';

// Re-export commonly used types with clear aliases
export type {
  ContactRole,
  ContactType,
  ContactStatus,
  ContactPriority,
  ContactSource
} from './Contact';

export type {
  LeadStatus,
  LeadSource,
  LeadOrigin,
  LeadServiceType,
  LeadPriority,
  LeadQuality
} from './Lead';

export type {
  CompanySize,
  CompanyType,
  CompanyStatus,
  BusinessSegment,
  TransactionInterest,
  GeographicScope
} from './Company';