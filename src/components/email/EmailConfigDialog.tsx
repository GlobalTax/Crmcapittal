import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Settings, Trash2, RefreshCw } from 'lucide-react';
import { useNylasAccounts } from '@/hooks/useNylasAccounts';

export const EmailConfigDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg">
          <Settings className="h-5 w-5 mr-3" />
          Configurar Email con Nylas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Configuración de Email con Nylas</DialogTitle>
          <p className="text-gray-600">Conecta tu cuenta de DonDominio para sincronizar tus emails</p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Existing Accounts */}
          <div>
            <h3 className="text-lg font-medium mb-3">Cuentas Configuradas</h3>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay cuentas configuradas. Añade tu primera cuenta de DonDominio abajo.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <Card key={account.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{account.email_address}</p>
                            <p className="text-sm text-muted-foreground">
                              Última sincronización: {account.last_sync_at 
                                ? new Date(account.last_sync_at).toLocaleString()
                                : 'Nunca'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(account.account_status)}>
                            {account.account_status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncEmails(account.id)}
                            disabled={isSyncing}
                          >
                            {isSyncing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add New Account Form */}
          <Card>
            <CardHeader>
              <CardTitle>Añadir Nueva Cuenta de DonDominio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@dominio.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imapHost">Servidor IMAP</Label>
                    <Input
                      id="imapHost"
                      value={formData.imapHost}
                      onChange={(e) => setFormData(prev => ({ ...prev, imapHost: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imapPort">Puerto IMAP</Label>
                    <Input
                      id="imapPort"
                      type="number"
                      value={formData.imapPort}
                      onChange={(e) => setFormData(prev => ({ ...prev, imapPort: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">Servidor SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={formData.smtpHost}
                      onChange={(e) => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Puerto SMTP</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={formData.smtpPort}
                      onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSettingUp} className="w-full">
                  {isSettingUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    'Configurar Cuenta'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="font-medium mb-1">Configuración para DonDominio:</p>
            <p>• IMAP: imap.dondominio.com:993 (SSL/TLS)</p>
            <p>• SMTP: smtp.dondominio.com:587 (STARTTLS)</p>
            <p>• Usuario: tu email completo</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
