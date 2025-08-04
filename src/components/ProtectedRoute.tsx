
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useUser, useAuthLoading } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [hasChecked, setHasChecked] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useUser();
  const loading = useAuthLoading();

  useEffect(() => {
    if (!loading) {
      setHasChecked(true);
      
      if (!user && !hasRedirected && location.pathname !== '/auth') {
        setHasRedirected(true);
        // Silent redirect to auth
        // Store the current location to redirect back after login
        navigate("/auth", { 
          state: { from: location.pathname },
          replace: true 
        });
      }
    }
  }, [user, loading, navigate, hasRedirected, location.pathname]);

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
