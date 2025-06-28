
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  FileText,
  Search,
  DollarSign
} from 'lucide-react';
import { useOperations } from '@/hooks/useOperations';

export const MainDashboard = () => {
  const { operations, loading } = useOperations();

  // Calculate key metrics
  const totalValue = operations.reduce((sum, op) => sum + op.amount, 0);
  const activeDeals = operations.filter(op => op.status === 'available').length;
  const completedDeals = operations.filter(op => op.status === 'completed').length;
  const totalDeals = operations.length;

  const quickActions = [
    {
      title: 'Gestionar Deals',
      description: 'Ver y administrar todas las operaciones',
      icon: Building2,
      href: '/deals',
      color: 'bg-blue-500'
    },
    {
      title: 'Analytics',
      description: 'Análisis y métricas detalladas',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-green-500'
    },
    {
      title: 'Reportes',
      description: 'Generar reportes personalizados',
      icon: FileText,
      href: '/reports',
      color: 'bg-purple-500'
    },
    {
      title: 'Búsqueda',
      description: 'Búsqueda inteligente de oportunidades',
      icon: Search,
      href: '/search',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard M&A</h1>
        <p className="text-gray-600 mt-2">
          Vista general de tu cartera de operaciones de fusiones y adquisiciones
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Portfolio completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Activos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeals}</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Completados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedDeals}</div>
            <p className="text-xs text-muted-foreground">
              Finalizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              En la cartera
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} to={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {action.description}
                    </p>
                    <Button variant="outline" className="w-full">
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operations.slice(0, 5).map((operation) => (
              <div key={operation.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {operation.company_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {operation.sector} • €{(operation.amount / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(operation.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
