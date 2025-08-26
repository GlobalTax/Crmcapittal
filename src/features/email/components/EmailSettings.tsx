import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Mail, Settings, Key, Bell } from 'lucide-react';
import { useEmailAccounts, useCreateEmailAccount, useUpdateEmailAccount, useDeleteEmailAccount } from '../hooks/useEmailAccounts';
import { EmailAccount } from '../types';

export const EmailSettings: React.FC = () => {
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);
  
  const { data: accounts = [], isLoading } = useEmailAccounts();
  const createAccount = useCreateEmailAccount();
  const updateAccount = useUpdateEmailAccount();
  const deleteAccount = useDeleteEmailAccount();

  const [accountForm, setAccountForm] = useState<{
    email_address: string;
    display_name: string;
    provider: string;
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    imap_host: string;
    imap_port: number;
    is_default: boolean;
    settings: Record<string, any>;
  }>({
    email_address: '',
    display_name: '',
    provider: 'smtp',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    imap_host: '',
    imap_port: 993,
    is_default: false,
    settings: {}
  });

  const [generalSettings, setGeneralSettings] = useState({
    signature_html: '',
    signature_text: '',
    auto_reply_enabled: false,
    auto_reply_message: '',
    tracking_enabled: true,
    sync_frequency: 15,
    notification_settings: {
      email_notifications: true,
      browser_notifications: true,
      new_email_sound: false
    }
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount.mutateAsync(accountForm);
      setIsCreateAccountOpen(false);
      resetAccountForm();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    
    try {
      await updateAccount.mutateAsync({
        id: editingAccount.id,
        updates: accountForm
      });
      setEditingAccount(null);
      resetAccountForm();
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cuenta de email?')) {
      try {
        await deleteAccount.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const resetAccountForm = () => {
    setAccountForm({
      email_address: '',
      display_name: '',
      provider: 'smtp',
      smtp_host: '',
      smtp_port: 587,
      smtp_username: '',
      smtp_password: '',
      imap_host: '',
      imap_port: 993,
      is_default: false,
      settings: {}
    });
  };

  const openEditAccount = (account: EmailAccount) => {
    setEditingAccount(account);
    setAccountForm({
      email_address: account.email_address,
      display_name: account.display_name || '',
      provider: account.provider,
      smtp_host: account.smtp_host || '',
      smtp_port: account.smtp_port || 587,
      smtp_username: account.smtp_username || '',
      smtp_password: account.smtp_password || '',
      imap_host: account.imap_host || '',
      imap_port: account.imap_port || 993,
      is_default: account.is_default,
      settings: account.settings
    });
  };

  const getProviderIcon = (provider: string) => {
    const icons = {
      gmail: '📧',
      outlook: '📨',
      smtp: '✉️',
      imap: '📮'
    };
    return icons[provider as keyof typeof icons] || '📧';
  };

  const getSyncStatusColor = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      syncing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (isLoading) {
    return (
      <Card className="h-full p-6">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Configuración de Email</h2>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Cuentas
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cuentas de Email</CardTitle>
                  <CardDescription>
                    Gestiona tus cuentas de email conectadas
                  </CardDescription>
                </div>
                <Dialog open={isCreateAccountOpen} onOpenChange={setIsCreateAccountOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Cuenta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Agregar Cuenta de Email</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAccount} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Dirección de Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={accountForm.email_address}
                          onChange={(e) => setAccountForm({...accountForm, email_address: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="display_name">Nombre para Mostrar</Label>
                        <Input
                          id="display_name"
                          value={accountForm.display_name}
                          onChange={(e) => setAccountForm({...accountForm, display_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider">Proveedor</Label>
                        <Select value={accountForm.provider} onValueChange={(value) => setAccountForm({...accountForm, provider: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gmail">Gmail</SelectItem>
                            <SelectItem value="outlook">Outlook</SelectItem>
                            <SelectItem value="smtp">SMTP/IMAP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {accountForm.provider === 'smtp' && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="smtp_host">SMTP Host</Label>
                              <Input
                                id="smtp_host"
                                value={accountForm.smtp_host}
                                onChange={(e) => setAccountForm({...accountForm, smtp_host: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="smtp_port">Puerto</Label>
                              <Input
                                id="smtp_port"
                                type="number"
                                value={accountForm.smtp_port}
                                onChange={(e) => setAccountForm({...accountForm, smtp_port: parseInt(e.target.value)})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="username">Usuario</Label>
                            <Input
                              id="username"
                              value={accountForm.smtp_username}
                              onChange={(e) => setAccountForm({...accountForm, smtp_username: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                              id="password"
                              type="password"
                              value={accountForm.smtp_password}
                              onChange={(e) => setAccountForm({...accountForm, smtp_password: e.target.value})}
                            />
                          </div>
                        </>
                      )}
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_default"
                          checked={accountForm.is_default}
                          onCheckedChange={(checked) => setAccountForm({...accountForm, is_default: checked})}
                        />
                        <Label htmlFor="is_default">Cuenta por defecto</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateAccountOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createAccount.isPending}>
                          {createAccount.isPending ? 'Creando...' : 'Crear Cuenta'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getProviderIcon(account.provider)}</span>
                      <div>
                        <p className="font-medium">{account.email_address}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.display_name || account.provider.toUpperCase()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getSyncStatusColor(account.sync_status)}>
                            {account.sync_status}
                          </Badge>
                          {account.is_default && (
                            <Badge variant="outline">Por defecto</Badge>
                          )}
                          {!account.is_active && (
                            <Badge variant="destructive">Inactiva</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditAccount(account)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteAccount(account.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay cuentas configuradas</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configura tus preferencias generales de email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="signature">Firma de Email (HTML)</Label>
                <Textarea
                  id="signature"
                  value={generalSettings.signature_html}
                  onChange={(e) => setGeneralSettings({...generalSettings, signature_html: e.target.value})}
                  placeholder="Tu firma aquí..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Respuesta Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar respuesta automática cuando recibas emails
                  </p>
                </div>
                <Switch
                  checked={generalSettings.auto_reply_enabled}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, auto_reply_enabled: checked})}
                />
              </div>

              {generalSettings.auto_reply_enabled && (
                <div>
                  <Label htmlFor="auto_reply">Mensaje de Respuesta Automática</Label>
                  <Textarea
                    id="auto_reply"
                    value={generalSettings.auto_reply_message}
                    onChange={(e) => setGeneralSettings({...generalSettings, auto_reply_message: e.target.value})}
                    placeholder="Gracias por tu email. Te responderé pronto..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Tracking de Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Rastrear apertura y clicks en emails enviados
                  </p>
                </div>
                <Switch
                  checked={generalSettings.tracking_enabled}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, tracking_enabled: checked})}
                />
              </div>

              <div>
                <Label htmlFor="sync_frequency">Frecuencia de Sincronización (minutos)</Label>
                <Select 
                  value={generalSettings.sync_frequency.toString()} 
                  onValueChange={(value) => setGeneralSettings({...generalSettings, sync_frequency: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button>Guardar Configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Controla cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones por email sobre nuevos mensajes
                  </p>
                </div>
                <Switch
                  checked={generalSettings.notification_settings.email_notifications}
                  onCheckedChange={(checked) => setGeneralSettings({
                    ...generalSettings,
                    notification_settings: {...generalSettings.notification_settings, email_notifications: checked}
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones del Navegador</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar notificaciones del navegador para nuevos emails
                  </p>
                </div>
                <Switch
                  checked={generalSettings.notification_settings.browser_notifications}
                  onCheckedChange={(checked) => setGeneralSettings({
                    ...generalSettings,
                    notification_settings: {...generalSettings.notification_settings, browser_notifications: checked}
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sonido de Nuevo Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproducir sonido cuando llegue un nuevo email
                  </p>
                </div>
                <Switch
                  checked={generalSettings.notification_settings.new_email_sound}
                  onCheckedChange={(checked) => setGeneralSettings({
                    ...generalSettings,
                    notification_settings: {...generalSettings.notification_settings, new_email_sound: checked}
                  })}
                />
              </div>

              <Button>Guardar Notificaciones</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Account Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cuenta de Email</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAccount} className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Dirección de Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={accountForm.email_address}
                onChange={(e) => setAccountForm({...accountForm, email_address: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-display_name">Nombre para Mostrar</Label>
              <Input
                id="edit-display_name"
                value={accountForm.display_name}
                onChange={(e) => setAccountForm({...accountForm, display_name: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_default"
                checked={accountForm.is_default}
                onCheckedChange={(checked) => setAccountForm({...accountForm, is_default: checked})}
              />
              <Label htmlFor="edit-is_default">Cuenta por defecto</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateAccount.isPending}>
                {updateAccount.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};