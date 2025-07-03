
import React, { useState } from 'react';
import { TransactionsDashboard } from '@/components/transactions/TransactionsDashboard';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { CreateTransactionDialog } from '@/components/transactions/CreateTransactionDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Transaction, CreateTransactionData } from '@/types/Transaction';

const Transactions: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { transactions, loading, error, createTransaction, updateTransaction } = useTransactions();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nda_pending':
      case 'teaser_requested':
      case 'infomemo_requested':
        return <Clock className="h-3 w-3" />;
      case 'nda_signed':
      case 'teaser_sent':
      case 'infomemo_sent':
        return <CheckCircle className="h-3 w-3" />;
      case 'due_diligence':
      case 'closing':
        return <TrendingUp className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nda_pending':
      case 'teaser_requested':
      case 'infomemo_requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'nda_signed':
      case 'teaser_sent':
      case 'infomemo_sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'due_diligence':
      case 'closing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'nda_pending': 'NDA Pendiente',
      'nda_signed': 'NDA Firmado',
      'teaser_requested': 'Teaser Solicitado',
      'teaser_sent': 'Teaser Enviado',
      'infomemo_requested': 'Info Memo Solicitado',
      'infomemo_sent': 'Info Memo Enviado',
      'due_diligence': 'Due Diligence',
      'closing': 'Cierre',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return statusLabels[status] || status;
  };

  const handleCreateTransaction = async (data: CreateTransactionData): Promise<void> => {
    try {
      await createTransaction(data);
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error al cargar transacciones: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacciones M&A</h1>
          <p className="text-muted-foreground">
            Gestiona todas las transacciones de fusiones y adquisiciones
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Transacción
        </Button>
      </div>

      {/* Dashboard and Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Lista de Transacciones</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <TransactionsDashboard transactions={transactions} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTable
            transactions={transactions}
            onUpdate={updateTransaction}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        </TabsContent>
      </Tabs>

      {/* Create Transaction Dialog */}
      <CreateTransactionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateTransaction}
      />
    </div>
  );
};

export default Transactions;
