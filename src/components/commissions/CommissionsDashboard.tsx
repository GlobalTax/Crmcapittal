import React from 'react';
import { StatsCard } from '@/components/ui/stats-card';
import { useCommissionStats } from '@/hooks/useCommissionStats';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserCollaborator } from '@/hooks/useUserCollaborator';
import { DollarSign, TrendingUp, Clock, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const CommissionsDashboard = () => {
  const { stats, loading } = useCommissionStats();
  const { role } = useUserRole();
  const { collaborator } = useUserCollaborator();

  const isAdmin = role === 'admin' || role === 'superadmin';

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={isAdmin ? "Comisiones Pendientes" : "Mis Comisiones Pendientes"}
          value={`€${stats?.pendingAmount?.toLocaleString() || '0'}`}
          icon={<Clock className="h-4 w-4" />}
          description={`${stats?.pendingCount || 0} comisiones`}
        />
        <StatsCard
          title={isAdmin ? "Pagadas Este Mes" : "Cobradas Este Mes"}
          value={`€${stats?.paidThisMonth?.toLocaleString() || '0'}`}
          icon={<DollarSign className="h-4 w-4" />}
          description={`${stats?.paidCount || 0} pagos`}
        />
        <StatsCard
          title={isAdmin ? "Colaboradores Activos" : "Mi Actividad"}
          value={isAdmin ? (stats?.activeCollaborators || 0) : (stats?.paidCount || 0)}
          icon={<Users className="h-4 w-4" />}
          description={isAdmin ? "Con comisiones" : "Comisiones este mes"}
        />
        <StatsCard
          title={isAdmin ? "Promedio por Colaborador" : "Total Personal"}
          value={`€${stats?.averageCommission?.toLocaleString() || '0'}`}
          icon={<TrendingUp className="h-4 w-4" />}
          description={isAdmin ? "Este mes" : "Este mes"}
        />
      </div>

      {/* Gráficos y detalles */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribución por fuente */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Fuente</CardTitle>
            <CardDescription>
              Origen de las comisiones generadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.sourceDistribution?.map((source) => (
              <div key={source.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{source.type}</span>
                  <span className="font-medium">
                    €{source.amount.toLocaleString()} ({source.percentage}%)
                  </span>
                </div>
                <Progress value={source.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top colaboradores (solo para admins) o Perfil personal */}
        {isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle>Top Colaboradores</CardTitle>
              <CardDescription>
                Mayor volumen de comisiones este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topCollaborators?.map((collaborator, index) => (
                  <div key={collaborator.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{collaborator.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {collaborator.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{collaborator.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {collaborator.count} comisiones
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Información de tu perfil como colaborador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <span className="font-medium">{collaborator?.name || 'No asignado'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tipo</span>
                  <span className="font-medium capitalize">{collaborator?.collaborator_type || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{collaborator?.email || 'No configurado'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Porcentaje Base</span>
                  <span className="font-medium">{collaborator?.commission_percentage || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alertas y acciones pendientes */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};