import { useAuth } from '@/contexts/AuthContext';

/**
 * Safe wrapper around useAuth that handles cases where the AuthProvider
 * might not be available during component initialization
 */
export const useSafeAuth = () => {
  try {
    return useAuth();
  } catch (error) {
    console.log('useSafeAuth: Auth context not available, returning defaults');
    return {
      user: null,
      session: null,
      loading: true,
      signIn: async () => ({ error: new Error('Auth not available') }),
      signUp: async () => ({ error: new Error('Auth not available') }),
      signOut: async () => {},
      signInWithProvider: async () => ({ error: new Error('Auth not available') }),
      refreshSession: async () => ({ error: new Error('Auth not available') })
    };
  }
};