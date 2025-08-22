import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SecureInput } from '@/components/security/SecureInput';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/useToast';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useRateLimit } from '@/utils/rateLimit';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, user } = useAuth();
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
    if (!checkRateLimit('login', userIdentifier)) {
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

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        let errorMessage = 'Ha ocurrido un error';
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.message?.includes('rate limit')) {
          errorMessage = 'Demasiados intentos. Intenta de nuevo más tarde.';
        }

        toast({
          title: 'Error al iniciar sesión',
          description: errorMessage,
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
            Iniciar Sesión
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Acceso restringido por invitación únicamente
          </p>
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
                required
                placeholder="Tu contraseña"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            ¿No tienes acceso? Contacta con tu administrador para recibir una invitación.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};