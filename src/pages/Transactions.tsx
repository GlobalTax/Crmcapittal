
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, Building, Users, DollarSign } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionsDashboard } from '@/components/transactions/TransactionsDashboard';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { CreateTransactionDialog } from '@/components/transactions/CreateTransactionDialog';

export default function Transactions() {
  const { transactions, loading, createTransaction, updateTransaction } = useTransactions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nda_pending': return <Clock className="h-4 w-4" />;
      case 'nda_signed': return <CheckCircle className="h-4 w-4" />;
      case 'teaser_sent': return <FileText className="h-4 w-4" />;
      case 'due_diligence': return <Building className="h-4 w-4" />;
      case 'closing': return <DollarSign className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nda_pending': return 'bg-yellow-100 text-yellow-800';
      case 'nda_signed': return 'bg-green-100 text-green-800';
      case 'teaser_sent': return 'bg-blue-100 text-blue-800';
      case 'due_diligence': return 'bg-purple-100 text-purple-800';
      case 'closing': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nda_pending': return 'NDA Pendiente';
      case 'nda_signed': return 'NDA Firmado';
      case 'teaser_requested': return 'Teaser Solicitado';
      case 'teaser_sent': return 'Teaser Enviado';
      case 'infomemo_requested': return 'Info Memo Solicitado';
      case 'infomemo_sent': return 'Info Memo Enviado';
      case 'due_diligence': return 'Due Diligence';
      case 'closing': return 'Cierre';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Transacciones M&A</h1>
          <p className="text-gray-600 mt-1">Administra el proceso completo desde NDA hasta cierre</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Transacción
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">NDAs Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.status === 'nda_pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Due Diligence</p>
                <p className="text-2xl font-bold text-purple-600">
                  {transactions.filter(t => t.status === 'due_diligence').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cierre</p>
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'closing').length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Transacciones</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Documentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <TransactionsDashboard transactions={transactions} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsTable 
            transactions={transactions}
            onUpdate={updateTransaction}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Documentos</CardTitle>
              <CardDescription>
                NDAs, Teasers e Info Memos por transacción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Gestión de Documentos</h3>
                <p className="text-sm mb-4">
                  Vista consolidada de todos los documentos por transacción
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Próximamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Transaction Dialog */}
      <CreateTransactionDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={createTransaction}
      />
    </div>
  );
}
