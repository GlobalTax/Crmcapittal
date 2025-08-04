// Context exports
export { NotificationProvider, useNotifications } from './NotificationContext';
export { FormValidationProvider, useFormValidation } from './FormValidationContext';

// Domain contexts
export { OperationsProvider, useOperationsContext } from './operations/OperationsProvider';
export { CompaniesProvider, useCompaniesContext } from './companies/CompaniesProvider';
export { ContactsProvider, useContactsContext } from './contacts/ContactsProvider';
export { UsersProvider, useUsersContext } from './users/UsersProvider';

// Global contexts
export { GlobalSearchProvider, useGlobalSearch } from './global/GlobalSearchProvider';

// Onboarding context
export { OnboardingProvider } from '../components/onboarding/OnboardingProvider';