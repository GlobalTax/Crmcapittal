
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Transaction } from '@/types/Transaction';
import { Building, Clock, CheckCircle, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface TransactionsDashboardProps {
  transactions: Transaction[];
}

export const TransactionsDashboard: React.FC<TransactionsDashboardProps> = ({ transactions }) => {
  const getStageProgress = (status: string) => {
    const stages = {
      'nda_pending': 10,
      'nda_signed': 25,
      'teaser_requested': 40,
      'teaser_sent': 55,
      'infomemo_requested': 70,
      'infomemo_sent': 85,
      'due_diligence': 90,
      'closing': 95,
      'completed': 100
    };
    return stages[status as keyof typeof stages] || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nda_pending': return 'bg-yellow-100 text-yellow-800';
      case 'nda_signed': return 'bg-green-100 text-green-800';
      case 'teaser_sent': return 'bg-blue-100 text-blue-800';
      case 'due_diligence': return 'bg-purple-100 text-purple-800';
      case 'closing': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalValue = transactions.reduce((sum, t) => sum + (t.estimated_value || 0), 0);
  const activeTransactions = transactions.filter(t => !['completed', 'cancelled'].includes(t.status));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total Pipeline</p>
                <p className="text-2xl font-bold text-green-600">
                  €{(totalValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {transactions.length} transacciones
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transacciones Activas</p>
                <p className="text-2xl font-bold text-blue-600">{activeTransactions.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((activeTransactions.length / transactions.length) * 100)}% del total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-purple-600">45d</p>
                <p className="text-xs text-gray-500 mt-1">
                  Desde NDA a cierre
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transacciones Activas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Transacciones en Proceso</span>
          </CardTitle>
          <CardDescription>
            Estado actual de las transacciones activas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTransactions.length > 0 ? (
            <div className="space-y-4">
              {activeTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {transaction.transaction_code}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.company?.name || 'Empresa no especificada'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {transaction.estimated_value && (
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          €{(transaction.estimated_value / 1000000).toFixed(1)}M
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium">{getStageProgress(transaction.status)}%</span>
                    </div>
                    <Progress value={getStageProgress(transaction.status)} className="h-2" />
                  </div>
                  
                  {transaction.expected_closing_date && (
                    <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                      <span>Cierre esperado:</span>
                      <span>{new Date(transaction.expected_closing_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {activeTransactions.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    y {activeTransactions.length - 5} transacciones más...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay transacciones activas</h3>
              <p className="text-sm">
                Las transacciones aparecerán aquí cuando se creen desde propuestas aprobadas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution by Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>
              Número de transacciones en cada etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                transactions.reduce((acc, t) => {
                  acc[t.status] = (acc[t.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Acciones</CardTitle>
            <CardDescription>
              Tareas pendientes que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">NDAs pendientes de firma</span>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  {transactions.filter(t => t.status === 'nda_pending').length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Teasers por enviar</span>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {transactions.filter(t => t.status === 'teaser_requested').length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Listos para cierre</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {transactions.filter(t => t.status === 'closing').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
