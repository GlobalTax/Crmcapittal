
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasChecked(true);
      
      if (!user) {
        console.log('ProtectedRoute: No user found, redirecting to auth');
        // Store the current location to redirect back after login
        navigate("/auth", { 
          state: { from: location.pathname },
          replace: true 
        });
      }
    }
  }, [user, loading, navigate, location.pathname]);

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

  return <>{children}</>;
};

export default ProtectedRoute;
