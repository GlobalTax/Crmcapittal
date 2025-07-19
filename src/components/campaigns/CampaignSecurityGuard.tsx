
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { securityMonitor } from '@/utils/security';
import { secureLogger } from '@/utils/secureLogger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface CampaignSecurityGuardProps {
  children: React.ReactNode;
  requiredAction?: string;
}

export const CampaignSecurityGuard: React.FC<CampaignSecurityGuardProps> = ({ 
  children, 
  requiredAction = 'view_campaigns' 
}) => {
  const { user } = useAuth();
  const { role, loading } = useUserRole();
  const [securityCheck, setSecurityCheck] = useState<{
    passed: boolean;
    message?: string;
  }>({ passed: false });

  useEffect(() => {
    if (!loading && user) {
      performSecurityCheck();
    }
  }, [user, role, loading, requiredAction]);

  const performSecurityCheck = () => {
    // Registrar intento de acceso
    securityMonitor.recordEvent('campaign_access_attempt', {
      userId: user?.id,
      userRole: role,
      requiredAction,
      timestamp: new Date().toISOString()
    });

    // Verificar permisos básicos
    if (!user) {
      setSecurityCheck({
        passed: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar roles para campañas
    const hasPermission = role === 'admin' || role === 'superadmin';
    
    if (!hasPermission) {
      secureLogger.security('unauthorized_campaign_access', 'medium', {
        userId: user.id,
        userRole: role,
        requiredAction
      });
      
      setSecurityCheck({
        passed: false,
        message: 'No tienes permisos suficientes para acceder a las campañas'
      });
      return;
    }

    // Verificar si el entorno es seguro
    const isSecureEnvironment = window.location.protocol === 'https:' || 
                               window.location.hostname === 'localhost';
    
    if (!isSecureEnvironment) {
      secureLogger.security('insecure_environment_access', 'high', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        userId: user.id
      });
    }

    setSecurityCheck({ passed: true });
    
    secureLogger.info('Campaign access granted', {
      userId: user.id,
      userRole: role,
      action: requiredAction
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 animate-pulse text-blue-500" />
          <span>Verificando permisos de seguridad...</span>
        </div>
      </div>
    );
  }

  if (!securityCheck.passed) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {securityCheck.message || 'Acceso denegado por razones de seguridad'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
