import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Key, Share, Mail, Copy, Eye, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientAccessLink {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  is_active: boolean;
  last_accessed_at?: string;
  created_at: string;
}

interface MandateClientAccessPanelProps {
  mandateId: string;
}

export const MandateClientAccessPanel = ({ mandateId }: MandateClientAccessPanelProps) => {
  const [accessLinks, setAccessLinks] = useState<ClientAccessLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const { toast } = useToast();

  // Mock data for now - in real implementation, fetch from API
  useEffect(() => {
    const mockAccessLinks: ClientAccessLink[] = [
      {
        id: '1',
        email: 'cliente@empresa.com',
        token: 'abc123def456',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        is_active: true,
        last_accessed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      },
    ];

    setAccessLinks(mockAccessLinks);
  }, [mandateId]);

  const generateClientAccess = async () => {
    if (!newClientEmail) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un email válido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // In real implementation, call API to create client access
      const newAccess: ClientAccessLink = {
        id: Date.now().toString(),
        email: newClientEmail,
        token: Math.random().toString(36).substring(2, 15),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      };

      setAccessLinks(prev => [newAccess, ...prev]);
      setNewClientEmail('');
      setShowGenerateForm(false);

      toast({
        title: 'Éxito',
        description: 'Enlace de acceso generado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el enlace de acceso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAccessLink = (token: string) => {
    const accessUrl = `${window.location.origin}/mandato/${mandateId}/cliente?token=${token}`;
    navigator.clipboard.writeText(accessUrl);
    toast({
      title: 'Copiado',
      description: 'Enlace de acceso copiado al portapapeles',
    });
  };

  const toggleAccessStatus = async (accessId: string, isActive: boolean) => {
    setAccessLinks(prev => 
      prev.map(link => 
        link.id === accessId 
          ? { ...link, is_active: isActive }
          : link
      )
    );

    toast({
      title: isActive ? 'Acceso activado' : 'Acceso desactivado',
      description: `El enlace de acceso ha sido ${isActive ? 'activado' : 'desactivado'}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Acceso de Cliente</h2>
          <p className="text-muted-foreground">
            Gestiona el acceso de clientes al portal del mandato
          </p>
        </div>
        <Button onClick={() => setShowGenerateForm(!showGenerateForm)}>
          <Key className="h-4 w-4 mr-2" />
          Generar Acceso
        </Button>
      </div>

      {/* Generate Access Form */}
      {showGenerateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share className="h-5 w-5 text-green-600" />
              Generar Nuevo Acceso
            </CardTitle>
            <CardDescription>
              Crea un enlace seguro para que el cliente pueda acceder al portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email del Cliente</label>
                <Input
                  type="email"
                  placeholder="cliente@empresa.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={generateClientAccess}
                  disabled={isLoading}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isLoading ? 'Generando...' : 'Generar Enlace'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowGenerateForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Links List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Enlaces de Acceso Activos
          </CardTitle>
          <CardDescription>
            Gestiona los enlaces de acceso generados para clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accessLinks.length === 0 ? (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay enlaces de acceso generados</p>
              </div>
            ) : (
              accessLinks.map((access) => (
                <div key={access.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{access.email}</span>
                      <div className="flex gap-2">
                        <Badge variant={access.is_active ? 'default' : 'secondary'}>
                          {access.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {isExpired(access.expires_at) && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expirado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={access.is_active}
                        onCheckedChange={(checked) => toggleAccessStatus(access.id, checked)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Creado: {formatDate(access.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Expira: {formatDate(access.expires_at)}</span>
                    </div>
                    {access.last_accessed_at && (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Último acceso: {formatDate(access.last_accessed_at)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyAccessLink(access.token)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Enlace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const accessUrl = `${window.location.origin}/mandato/${mandateId}/cliente?token=${access.token}`;
                        window.open(accessUrl, '_blank');
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Como Cliente
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Información importante:</strong> Los enlaces de acceso permiten a los clientes 
          ver el progreso de su mandato sin necesidad de crear una cuenta. Los enlaces expiran 
          automáticamente después de 30 días por seguridad.
        </AlertDescription>
      </Alert>
    </div>
  );
};