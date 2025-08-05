import React from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SecuritySummary = () => {
  const fixedIssues = [
    {
      type: 'critical',
      title: 'Eliminadas llamadas a servicios externos de IP',
      description: 'Reemplazadas las llamadas a api.ipify.org con funciones internas seguras',
      status: 'fixed'
    },
    {
      type: 'critical', 
      title: 'Mejorada sanitización XSS',
      description: 'Añadido suppressHydrationWarning y filtros adicionales para dangerouslySetInnerHTML',
      status: 'fixed'
    },
    {
      type: 'medium',
      title: 'Reforzadas funciones de base de datos',
      description: 'Añadido search_path SET TO \'public\' a todas las funciones SECURITY DEFINER',
      status: 'fixed'
    },
    {
      type: 'medium',
      title: 'Implementado logging seguro con protección PII',
      description: 'Creada función enhanced_log_security_event que enmascara datos sensibles',
      status: 'fixed'
    },
    {
      type: 'medium',
      title: 'Reforzado rate limiting',
      description: 'Implementado rate limiting híbrido cliente-servidor con fallback seguro',
      status: 'fixed'
    },
    {
      type: 'low',
      title: 'Añadidos headers de seguridad',
      description: 'Implementado SecurityHeaders component con CSP y headers de seguridad',
      status: 'fixed'
    }
  ];

  const pendingIssues = [
    {
      type: 'critical',
      title: '5 Security Definer Views detectadas',
      description: 'Deben ser reemplazadas por vistas estándar o políticas RLS apropiadas',
      status: 'pending',
      action: 'Requerir intervención manual en Supabase'
    },
    {
      type: 'medium',
      title: 'Configuración de autenticación de Supabase',
      description: 'Habilitar protección de contraseñas filtradas y reducir expiración OTP',
      status: 'pending',
      action: 'Configurar en panel de Supabase Auth'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Resumen de Correcciones de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Se han implementado las siguientes correcciones de seguridad críticas:
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-green-600">✅ Problemas Corregidos</h4>
            {fixedIssues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                {getStatusIcon(issue.status)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <Badge variant={getTypeColor(issue.type) as any} className="text-xs">
                      {issue.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-yellow-600">⚠️ Pendientes de Configuración Manual</h4>
            {pendingIssues.map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                {getStatusIcon(issue.status)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{issue.title}</span>
                    <Badge variant={getTypeColor(issue.type) as any} className="text-xs">
                      {issue.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.description}</p>
                  <p className="text-xs font-medium text-yellow-700">Acción: {issue.action}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">📋 Próximos Pasos</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Ejecutar el linter de seguridad de Supabase para confirmar las correcciones</li>
              <li>Revisar y eliminar las 5 Security Definer Views identificadas</li>
              <li>Configurar protección de contraseñas filtradas en Supabase Auth</li>
              <li>Reducir tiempo de expiración OTP a valores recomendados</li>
              <li>Programar auditorías de seguridad regulares</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};