
/**
 * Centralized type exports for the application
 * This file provides a single entry point for all type definitions
 */

// Base types
export * from './Base';

// Entity types
export * from './Contact';
export * from './Company';
export * from './Operation';
export * from './AutomatedNotifications';

// Re-export commonly used types with clear aliases
export type {
  ContactRole,
  ContactType,
  ContactStatus,
  ContactPriority,
  ContactSource
} from './Contact';


export type {
  CompanySize,
  CompanyType,
  CompanyStatus,
  BusinessSegment,
  TransactionInterest,
  GeographicScope
} from './Company';
