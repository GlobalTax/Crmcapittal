import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/productionLogger';
import { Mail, Users, Clock, CheckCircle, XCircle, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  used_at?: string;
  user_id?: string;
}

const InvitationManager = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      // Use direct query since table isn't in generated types yet
      const { data, error } = await supabase
        .from('pending_invitations' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Safely cast the data
      const invitationsData = (data as unknown as Invitation[]) || [];
      setInvitations(invitationsData);
    } catch (error: any) {
      logger.error('Failed to fetch invitations', { error });
      toast({
        title: "Error",
        description: "No se pudieron cargar las invitaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "El email es requerido",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: { email: email.trim(), role },
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        }
      });

      if (error) throw error;

      toast({
        title: "¡Invitación enviada!",
        description: `Se ha enviado la invitación a ${email}`,
      });

      setEmail('');
      setRole('user');
      fetchInvitations();
    } catch (error: any) {
      logger.error('Failed to send invitation', { error, email, role });
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la invitación",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pending_invitations' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Invitación eliminada",
        description: "La invitación ha sido eliminada exitosamente",
      });

      fetchInvitations();
    } catch (error: any) {
      logger.error('Failed to delete invitation', { error, invitationId: id });
      toast({
        title: "Error",
        description: "No se pudo eliminar la invitación",
        variant: "destructive",
      });
    }
  };

  const getInvitationStatus = (invitation: Invitation) => {
    if (invitation.used_at) {
      return { status: 'used', label: 'Usada', color: 'bg-green-100 text-green-800' };
    }
    
    if (new Date(invitation.expires_at) < new Date()) {
      return { status: 'expired', label: 'Expirada', color: 'bg-red-100 text-red-800' };
    }
    
    return { status: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'used':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Gestión de Invitaciones</h2>
      </div>

      {/* Send New Invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Nueva Invitación
          </CardTitle>
          <CardDescription>
            Invita nuevos usuarios a la plataforma asignándoles un rol específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email del usuario</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="superadmin">Super Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Invitaciones Enviadas</CardTitle>
          <CardDescription>
            Lista de todas las invitaciones enviadas y su estado actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay invitaciones enviadas aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const { status, label, color } = getInvitationStatus(invitation);
                
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{invitation.email}</span>
                        <Badge variant="secondary" className={color}>
                          {getStatusIcon(status)}
                          <span className="ml-1">{label}</span>
                        </Badge>
                        <Badge variant="outline">
                          {invitation.role}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Enviada: {format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                        <p>Expira: {format(new Date(invitation.expires_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                        {invitation.used_at && (
                          <p>Usada: {format(new Date(invitation.used_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationManager;