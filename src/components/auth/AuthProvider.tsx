import React from 'react';
import { AuthProvider as AuthProviderContext } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <AuthProviderContext>{children}</AuthProviderContext>;
};