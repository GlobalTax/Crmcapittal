// Contacts Feature - Barrel Export

// Types
export type {
  Contact,
  ContactRole,
  ContactType,
  ContactPriority,
  ContactStatus,
  ContactSource,
  EcosystemRole,
  ContactLifecycleStage,
  DealPreferences,
  CreateContactData,
  UpdateContactData,
  ContactFilters,
  ContactSortOptions,
  ContactSearchOptions
} from './types';

// Services
export { ContactService } from './services';
export type {
  DbContact,
  ContactActivity,
  ContactNote,
  ContactInteraction
} from './services';

// Stores
export {
  useContactsStore,
  useContacts,
  useContactsLoading,
  useContactsError,
  useSelectedContacts,
  useSelectedContact,
  useContactsFilters,
  useContactsSearchTerm,
  useContactsPagination,
  useFilteredContacts,
  useSortedContacts,
  usePaginatedContacts
} from './stores';

// Hooks and Components will be added as they are migrated