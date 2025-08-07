import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Settings, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNylasAccounts } from '@/hooks/useNylasAccounts';
import { useToast } from '@/hooks/use-toast';

export default function EmailSetup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    imapHost: 'imap.dondominio.com',
    imapPort: 993,
    smtpHost: 'smtp.dondominio.com',
    smtpPort: 587,
  });

  const {
    accounts,
    isLoading,
    setupAccount,
    isSettingUp,
    syncEmails,
    isSyncing,
    deleteAccount,
    isDeleting,
  } = useNylasAccounts();

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setupAccount(formData);
    setFormData({
      email: '',
      password: '',
      imapHost: 'imap.dondominio.com',
      imapPort: 993,
      smtpHost: 'smtp.dondominio.com',
      smtpPort: 587,
    });
    toast({
      title: "Cuenta configurada",
      description: "Tu cuenta de email se ha configurado correctamente con Nylas",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Email</h1>
        </div>

        {/* Existing Accounts */}
        {isLoading ? (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Cargando cuentas...</span>
              </div>
            </CardContent>
          </Card>
        ) : accounts && accounts.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Cuentas Configuradas ({accounts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(account.account_status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{account.email_address}</p>
                        <p className="text-sm text-gray-500">
                          Última sincronización: {account.last_sync_at 
                            ? new Date(account.last_sync_at).toLocaleString('es-ES')
                            : 'Nunca'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(account.account_status)}>
                        {account.account_status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncEmails(account.id)}
                        disabled={isSyncing}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        {isSyncing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Sincronizar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAccount(account.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Add New Account Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-6 w-6" />
              {accounts && accounts.length > 0 ? 'Añadir Nueva Cuenta' : 'Configura tu Primera Cuenta'}
            </CardTitle>
            <p className="text-gray-600">
              Introduce los datos de tu cuenta de DonDominio para conectarla con Nylas
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Dirección de Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@dominio.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="imapHost" className="text-sm font-medium">
                    Servidor IMAP
                  </Label>
                  <Input
                    id="imapHost"
                    value={formData.imapHost}
                    onChange={(e) => setFormData(prev => ({ ...prev, imapHost: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imapPort" className="text-sm font-medium">
                    Puerto IMAP
                  </Label>
                  <Input
                    id="imapPort"
                    type="number"
                    value={formData.imapPort}
                    onChange={(e) => setFormData(prev => ({ ...prev, imapPort: parseInt(e.target.value) }))}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost" className="text-sm font-medium">
                    Servidor SMTP
                  </Label>
                  <Input
                    id="smtpHost"
                    value={formData.smtpHost}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="text-sm font-medium">
                    Puerto SMTP
                  </Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={formData.smtpPort}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSettingUp} 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Configurando con Nylas...
                  </>
                ) : (
                  <>
                    <Mail className="mr-3 h-5 w-5" />
                    Conectar con Nylas
                  </>
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Configuración para DonDominio:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>IMAP:</strong> imap.dondominio.com:993 (SSL/TLS)</p>
                <p>• <strong>SMTP:</strong> smtp.dondominio.com:587 (STARTTLS)</p>
                <p>• <strong>Usuario:</strong> tu dirección de email completa</p>
                <p>• <strong>Integración:</strong> Conectado a través de Nylas API</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Sincronización Automática</h3>
                <p className="text-sm text-gray-600">
                  Nylas sincroniza automáticamente tus emails en tiempo real
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Gestión Profesional</h3>
                <p className="text-sm text-gray-600">
                  Herramientas avanzadas para la gestión de emails empresariales
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Compatible</h3>
                <p className="text-sm text-gray-600">
                  Funciona con DonDominio y otros proveedores de email
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
