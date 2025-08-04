/**
 * Contacts Hooks
 */

// New feature-specific hooks
export { useContacts as useContactsNew } from './useContacts';
export { useContact as useContactNew } from './useContacts';

// Legacy exports for backward compatibility
export * from '@/hooks/useContacts';
export * from '@/hooks/useContactsCRUD';
export * from '@/hooks/useContactsFiltered';
export * from '@/hooks/useContactsOptimized';