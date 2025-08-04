import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Eye, Lock, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface SecurityLog {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  metadata: any;
  user_email?: string | null;
  ip_address?: unknown;
  created_at: string;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  recentActivity: number;
}

export const SecurityDashboard: React.FC = () => {
  const { role } = useUserRole();
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highEvents: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'admin' || role === 'superadmin') {
      fetchSecurityData();
    }
  }, [role]);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent security logs with available columns
      const { data: logs, error: logsError } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setSecurityLogs((logs as SecurityLog[]) || []);

      // Calculate stats
      const total = logs?.length || 0;
      const critical = logs?.filter(log => log.severity === 'critical').length || 0;
      const high = logs?.filter(log => log.severity === 'high').length || 0;
      const recent = logs?.filter(log => {
        const logDate = new Date(log.created_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return logDate > yesterday;
      }).length || 0;

      setStats({
        totalEvents: total,
        criticalEvents: critical,
        highEvents: high,
        recentActivity: recent
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Eye className="w-4 h-4" />;
      case 'low': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Solo los administradores pueden acceder al panel de seguridad.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Panel de Seguridad</h2>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Últimos 50 eventos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Alta Prioridad</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.highEvents}</div>
            <p className="text-xs text-muted-foreground">Monitoreo necesario</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Logs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos los Eventos</TabsTrigger>
          <TabsTrigger value="critical">Críticos</TabsTrigger>
          <TabsTrigger value="high">Alta Prioridad</TabsTrigger>
          <TabsTrigger value="auth">Autenticación</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Seguridad Recientes</CardTitle>
              <CardDescription>
                Últimos 50 eventos de seguridad registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getSeverityIcon(log.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {log.event_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <Badge variant={getSeverityColor(log.severity) as any}>
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-4">
                        <span>Usuario: {log.user_email || 'Sistema'}</span>
                         <span>IP: {String(log.ip_address) || 'N/A'}</span>
                        <span>Fecha: {new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-primary">
                            Ver detalles
                          </summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
                {securityLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron eventos de seguridad
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Críticos</CardTitle>
              <CardDescription>
                Eventos que requieren atención inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs
                  .filter(log => log.severity === 'critical')
                  .map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 border border-destructive rounded-lg bg-destructive/5">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive">
                          {log.event_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Alta Prioridad</CardTitle>
              <CardDescription>
                Eventos que requieren monitoreo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs
                  .filter(log => log.severity === 'high')
                  .map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-orange-700">
                          {log.event_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Autenticación</CardTitle>
              <CardDescription>
                Intentos de login, registro y operaciones de autenticación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityLogs
                  .filter(log => log.event_type.includes('login') || log.event_type.includes('signup') || log.event_type.includes('authentication'))
                  .map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Lock className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {log.event_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.description}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-4">
                          <span>Usuario: {log.user_email || 'N/A'}</span>
                          <span>IP: {String(log.ip_address) || 'N/A'}</span>
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};