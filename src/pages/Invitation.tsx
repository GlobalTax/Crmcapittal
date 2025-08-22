import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Invitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validatePasswordStrength } = useSecureAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<any>(null);
  const [step, setStep] = useState<'validating' | 'creating' | 'success' | 'error'>('validating');

  useEffect(() => {
    if (!token) {
      setStep('error');
      setLoading(false);
      return;
    }
    validateInvitation();
  }, [token]);

  useEffect(() => {
    if (password) {
      validatePasswordStrength(password).then(setPasswordValidation);
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase.rpc('validate_invitation_token' as any, {
        p_token: token
      });

      if (error) throw error;

      const result = data as any;
      if (result.valid) {
        setInvitation(result);
        setStep('creating');
      } else {
        toast({
          title: "Invitación inválida",
          description: result.error || "La invitación ha expirado o no es válida",
          variant: "destructive",
        });
        setStep('error');
      }
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      toast({
        title: "Error",
        description: "No se pudo validar la invitación",
        variant: "destructive",
      });
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation?.isValid) {
      toast({
        title: "Contraseña inválida",
        description: passwordValidation?.errors?.join(', ') || "La contraseña no cumple los requisitos",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            invitation_token: token
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Complete the invitation
        const { error: completeError } = await supabase.rpc('complete_invitation' as any, {
          p_token: token,
          p_user_id: authData.user.id
        });

        if (completeError) throw completeError;

        setStep('success');
        
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Tu cuenta ha sido activada. Serás redirigido en unos segundos.",
        });

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Validando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <CardTitle className="text-2xl">CRM Pro</CardTitle>
              <CardDescription>M&A Platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {step === 'creating' && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">¡Bienvenido!</h3>
                <p className="text-muted-foreground">
                  Has sido invitado como <span className="font-medium text-blue-600">{invitation?.role}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {invitation?.email}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Crea tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {passwordValidation && !passwordValidation.isValid && (
                    <div className="text-sm text-red-600">
                      <ul className="list-disc list-inside space-y-1">
                        {passwordValidation.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting || !passwordValidation?.isValid}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear mi cuenta'
                  )}
                </Button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">¡Cuenta creada exitosamente!</h3>
              <p className="text-muted-foreground mb-4">
                Tu cuenta ha sido activada con el rol de <span className="font-medium text-blue-600">{invitation?.role}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Serás redirigido automáticamente...
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Invitación inválida</h3>
              <p className="text-muted-foreground mb-4">
                Esta invitación ha expirado o no es válida.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Ir al inicio
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invitation;