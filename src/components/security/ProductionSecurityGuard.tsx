import React from 'react';

interface ProductionSecurityGuardProps {
  children: React.ReactNode;
  allowInDevelopment?: boolean;
}

/**
 * Production Security Guard - Prevents debug components from rendering in production
 */
export const ProductionSecurityGuard: React.FC<ProductionSecurityGuardProps> = ({ 
  children, 
  allowInDevelopment = true 
}) => {
  // Only render children in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && !allowInDevelopment) {
    return null;
  }
  
  if (isDevelopment && allowInDevelopment) {
    return <>{children}</>;
  }
  
  return null;
};