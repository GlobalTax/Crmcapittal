import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Mail, Zap, Bell, Settings, TrendingUp } from 'lucide-react';
import { EmailTemplateManager } from './EmailTemplateManager';
import { AutomationRulesManager } from './AutomationRulesManager';
import { NotificationCenter } from './NotificationCenter';
import { useEmailTemplates, useAutomationRules, useSystemNotifications } from '@/hooks/useAutomationSystem';

export const AutomationDashboard: React.FC = () => {
  const { templates } = useEmailTemplates();
  const { rules } = useAutomationRules();
  const { unreadCount } = useSystemNotifications();

  const activeTemplates = templates.filter(t => t.is_active).length;
  const activeRules = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantillas Activas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTemplates}</div>
            <p className="text-xs text-muted-foreground">
              de {templates.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reglas Activas</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
            <p className="text-xs text-muted-foreground">
              de {rules.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              sin leer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500 text-white">
                Activo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para las diferentes secciones */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="gap-2">
            <Mail className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Bot className="h-4 w-4" />
            Reglas
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <AutomationRulesManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Automatización</CardTitle>
              <CardDescription>
                Ajusta los parámetros generales del sistema de automatización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>Configuración avanzada próximamente</p>
                <p className="text-sm">
                  Aquí podrás configurar integraciones con servicios externos,
                  ajustar intervalos de ejecución y más opciones avanzadas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};