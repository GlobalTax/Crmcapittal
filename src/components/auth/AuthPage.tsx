import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SecureInput } from '@/components/security/SecureInput';
import { useAuth } from '@/stores/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/useToast';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useRateLimit } from '@/utils/rateLimit';

type AuthMode = 'signin' | 'signup';

export const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, user, signInWithProvider } = useAuth();
  const { sanitizeInput, validateEmail } = useSecureInput();
  const { checkRateLimit } = useRateLimit();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const userIdentifier = email || 'anonymous';
    if (!checkRateLimit(mode === 'signin' ? 'login' : 'signup', userIdentifier)) {
      toast({
        title: 'Demasiados intentos',
        description: 'Has excedido el límite de intentos. Intenta de nuevo más tarde.',
        variant: 'destructive'
      });
      return;
    }

    // Validation
    if (!validateEmail(email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingresa un email válido.',
        variant: 'destructive'
      });
      return;
    }

    if (mode === 'signup') {
      if (password.length < 8) {
        toast({
          title: 'Contraseña débil',
          description: 'La contraseña debe tener al menos 8 caracteres.',
          variant: 'destructive'
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Contraseñas no coinciden',
          description: 'Las contraseñas deben ser idénticas.',
          variant: 'destructive'
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error } = mode === 'signin' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        let errorMessage = 'Ha ocurrido un error';
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.message?.includes('Email already registered')) {
          errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
        } else if (error.message?.includes('Password should be at least')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (error.message?.includes('rate limit')) {
          errorMessage = 'Demasiados intentos. Intenta de nuevo más tarde.';
        }

        toast({
          title: mode === 'signin' ? 'Error al iniciar sesión' : 'Error al registrarse',
          description: errorMessage,
          variant: 'destructive'
        });
      } else if (mode === 'signup') {
        toast({
          title: 'Registro exitoso',
          description: 'Revisa tu email para confirmar tu cuenta.',
          variant: 'default'
        });
      }
    } catch (error) {
      toast({
        title: 'Error inesperado',
        description: 'Ha ocurrido un error inesperado. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'microsoft' | 'google') => {
    const userIdentifier = 'oauth_' + provider;
    if (!checkRateLimit('login', userIdentifier)) {
      toast({
        title: 'Demasiados intentos',
        description: 'Has excedido el límite de intentos. Intenta de nuevo más tarde.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        toast({
          title: 'Error de autenticación',
          description: `No se pudo conectar con ${provider}. Intenta de nuevo.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error inesperado',
        description: 'Ha ocurrido un error inesperado. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === 'signin' ? 'Iniciar Sesión' : 'Registrarse'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <SecureInput
                id="email"
                type="email"
                value={email}
                onChange={(value) => setEmail(sanitizeInput(value, { maxLength: 320 }))}
                enableSanitization={true}
                maxLength={320}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <SecureInput
                id="password"
                type="password"
                value={password}
                onChange={(value) => setPassword(sanitizeInput(value, { maxLength: 128, allowHtml: false }))}
                enableSanitization={true}
                maxLength={128}
                showPasswordStrength={mode === 'signup'}
                required
                placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <SecureInput
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(value) => setConfirmPassword(sanitizeInput(value, { maxLength: 128, allowHtml: false }))}
                  enableSanitization={true}
                  maxLength={128}
                  required
                  placeholder="Repite tu contraseña"
                  errorMessage={confirmPassword && password !== confirmPassword ? 'Las contraseñas no coinciden' : undefined}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Procesando...' : (mode === 'signin' ? 'Iniciar Sesión' : 'Registrarse')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('microsoft')}
              disabled={isLoading}
              className="w-full"
            >
              Microsoft
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full"
            >
              Google
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              disabled={isLoading}
              className="text-sm"
            >
              {mode === 'signin' 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión aquí'
              }
            </Button>
          </div>

          {mode === 'signup' && (
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Al registrarte, aceptas nuestros términos de servicio.</p>
              <p>Tu información será protegida con los más altos estándares de seguridad.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};