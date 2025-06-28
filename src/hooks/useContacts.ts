
import { useContactsMain } from './contacts/useContactsMain';
import { useContactNotes } from './contacts/useContactNotes';

// Re-export the main contacts hook as the default export
export const useContacts = useContactsMain;

// Export the notes hook separately
export { useContactNotes };
