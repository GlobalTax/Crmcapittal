import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoginAttempt {
  timestamp: number;
  success: boolean;
}

interface SecurityState {
  failedAttempts: LoginAttempt[];
  isLocked: boolean;
  lockUntil: number | null;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function useSecureAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityState, setSecurityState] = useState<SecurityState>({
    failedAttempts: [],
    isLocked: false,
    lockUntil: null
  });

  // Password strength validation
  const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un símbolo especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Check if account is locked
  const isAccountLocked = (): boolean => {
    const now = Date.now();
    if (securityState.lockUntil && now < securityState.lockUntil) {
      return true;
    }
    return false;
  };

  // Add failed login attempt
  const addFailedAttempt = () => {
    const now = Date.now();
    const recentAttempts = securityState.failedAttempts.filter(
      attempt => now - attempt.timestamp < LOCKOUT_DURATION
    );
    
    const newAttempts = [...recentAttempts, { timestamp: now, success: false }];
    
    const newSecurityState: SecurityState = {
      failedAttempts: newAttempts,
      isLocked: newAttempts.length >= MAX_FAILED_ATTEMPTS,
      lockUntil: newAttempts.length >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION : null
    };
    
    setSecurityState(newSecurityState);
    
    if (newSecurityState.isLocked) {
      toast.error(`Cuenta bloqueada por ${MAX_FAILED_ATTEMPTS} intentos fallidos. Intenta de nuevo en 15 minutos.`);
    }
  };

  // Clear failed attempts on successful login
  const clearFailedAttempts = () => {
    setSecurityState({
      failedAttempts: [],
      isLocked: false,
      lockUntil: null
    });
  };

  const signUp = async (email: string, password: string, additionalData?: any) => {
    try {
      if (isAccountLocked()) {
        throw new Error('Cuenta temporalmente bloqueada');
      }

      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: additionalData
        }
      });

      if (error) throw error;

      // Log successful signup attempt
      await supabase.rpc('log_security_event', {
        p_event_type: 'signup_success',
        p_severity: 'low',
        p_description: 'Successful user signup',
        p_metadata: { email }
      });

      toast.success('Cuenta creada exitosamente. Revisa tu email para confirmar.');
      return { error: null };
    } catch (error: any) {
      // Log failed signup attempt
      await supabase.rpc('log_security_event', {
        p_event_type: 'signup_failed',
        p_severity: 'medium',
        p_description: 'Failed signup attempt',
        p_metadata: { email, error: error.message }
      });

      toast.error(error.message);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isAccountLocked()) {
        throw new Error('Cuenta temporalmente bloqueada');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        addFailedAttempt();
        
        // Log failed login attempt
        await supabase.rpc('log_security_event', {
          p_event_type: 'login_failed',
          p_severity: 'medium',
          p_description: 'Failed login attempt',
          p_metadata: { email, error: error.message }
        });
        
        throw error;
      }

      clearFailedAttempts();
      
      // Log successful login
      await supabase.rpc('log_security_event', {
        p_event_type: 'login_success',
        p_severity: 'low',
        p_description: 'Successful user login',
        p_metadata: { email }
      });

      toast.success('Sesión iniciada exitosamente');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Log successful logout
      await supabase.rpc('log_security_event', {
        p_event_type: 'logout_success',
        p_severity: 'low',
        p_description: 'Successful user logout',
        p_metadata: { user_id: user?.id }
      });

      toast.success('Sesión cerrada exitosamente');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message);
      return { error };
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    validatePasswordStrength,
    isAccountLocked: isAccountLocked(),
    remainingLockTime: securityState.lockUntil ? Math.max(0, securityState.lockUntil - Date.now()) : 0
  };
}