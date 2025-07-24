import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Error de autenticación",
            description: error.message,
            variant: "destructive",
          });
          navigate('/auth', { replace: true });
          return;
        }

        if (data.session) {
          // Success - user is authenticated
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión correctamente con Google.",
          });
          
          // Redirect to the intended destination or dashboard
          const from = sessionStorage.getItem('auth_redirect') || '/';
          sessionStorage.removeItem('auth_redirect');
          navigate(from, { replace: true });
        } else {
          // No session found, redirect to auth
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Unexpected error in OAuth callback:', error);
        toast({
          title: "Error",
          description: "Ha ocurrido un error inesperado durante la autenticación.",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Procesando autenticación...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;