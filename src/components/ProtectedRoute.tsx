
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [hasChecked, setHasChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      setHasChecked(true);
      
      if (!user) {
        // Silent redirect to auth
        // Store the current location to redirect back after login
        navigate("/auth", { 
          state: { from: location.pathname },
          replace: true 
        });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  // Show error state if auth system is broken
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-slate-600">Error en el sistema de autenticación</p>
          <p className="text-slate-500 text-sm mt-2">Intenta recargar la página</p>
        </div>
      </div>
    );
  }

  // Show loading while auth is being determined
  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if there's no user (we're redirecting)
  if (!user) {
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
