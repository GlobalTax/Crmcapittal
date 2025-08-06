import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, Activity, Users, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { useUserRole } from '@/hooks/useUserRole';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string; // Change to string to match DB response
  description: string;
  created_at: string;
  user_email?: string;
  metadata?: any;
}

interface AuditResult {
  status: string;
  timestamp: string;
  findings: Array<{
    type: string;
    severity: string;
    count: number;
    description: string;
  }>;
}

export const SecurityDashboard: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { role } = useUserRole();

  // Only allow admins to view security dashboard
  if (role !== 'admin' && role !== 'superadmin') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Acceso Restringido</h3>
        <p className="text-red-700">
          No tienes permisos para acceder al panel de seguridad.
        </p>
      </div>
    );
  }

  const loadSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSecurityEvents((data || []) as SecurityEvent[]);
    } catch (error) {
      console.error('Error loading security events:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los eventos de seguridad',
        variant: 'destructive'
      });
    }
  };

  const runSecurityAudit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('run_security_audit');
      
      if (error) throw error;
      setAuditResult(data as unknown as AuditResult);
      
      toast({
        title: 'Auditoría Completada',
        description: 'La auditoría de seguridad se ha ejecutado correctamente',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error running security audit:', error);
      toast({
        title: 'Error',
        description: 'No se pudo ejecutar la auditoría de seguridad',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const criticalEvents = securityEvents.filter(e => e.severity === 'critical').length;
  const highEvents = securityEvents.filter(e => e.severity === 'high').length;
  const recentEvents = securityEvents.filter(e => 
    new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Panel de Seguridad
        </h2>
        <Button onClick={runSecurityAudit} disabled={loading}>
          <Activity className="h-4 w-4 mr-2" />
          {loading ? 'Ejecutando...' : 'Ejecutar Auditoría'}
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos de Alto Riesgo</p>
                <p className="text-2xl font-bold text-orange-600">{highEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos (24h)</p>
                <p className="text-2xl font-bold text-blue-600">{recentEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado General</p>
                <p className="text-2xl font-bold text-green-600">
                  {criticalEvents === 0 ? 'Seguro' : 'En Riesgo'}
                </p>
              </div>
              {criticalEvents === 0 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Eventos de Seguridad</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Seguridad Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hay eventos de seguridad registrados
                  </p>
                ) : (
                  securityEvents.slice(0, 20).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{event.event_type}</span>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        {event.user_email && (
                          <p className="text-xs text-gray-500">Usuario: {event.user_email}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultado de Auditoría de Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              {auditResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-800">Estado: {auditResult.status}</span>
                    <span className="text-sm text-green-600">
                      {new Date(auditResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {auditResult.findings.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-800">
                        ¡Sistema Seguro!
                      </h3>
                      <p className="text-green-600">
                        No se encontraron problemas de seguridad en la auditoría.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Hallazgos de Seguridad:</h4>
                      {auditResult.findings.map((finding, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <Badge className={getSeverityColor(finding.severity)}>
                              {finding.severity.toUpperCase()}
                            </Badge>
                            <span className="ml-2 font-medium">{finding.type}</span>
                            <p className="text-sm text-gray-600 mt-1">
                              {finding.description}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {finding.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">
                    Auditoría de Seguridad
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ejecuta una auditoría para revisar el estado de seguridad del sistema.
                  </p>
                  <Button onClick={runSecurityAudit} disabled={loading}>
                    <Activity className="h-4 w-4 mr-2" />
                    Ejecutar Auditoría
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};