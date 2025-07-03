
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Transaction } from '@/types/Transaction';
import { MoreHorizontal, Eye, Edit, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionsTableProps {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Transaction>) => Promise<Transaction>;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onUpdate,
  getStatusIcon,
  getStatusColor,
  getStatusLabel
}) => {
  const formatCurrency = (amount?: number, currency = 'EUR') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Lista de Transacciones</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Valor Estimado</TableHead>
                  <TableHead>Fecha Cierre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {transaction.transaction_code || transaction.id.slice(0, 8)}
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.company?.name || 'No especificada'}
                        </div>
                        {transaction.proposal?.title && (
                          <div className="text-sm text-gray-500">
                            {transaction.proposal.title}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span>{getStatusLabel(transaction.status)}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(transaction.estimated_value, transaction.currency)}
                      </div>
                      {transaction.priority && (
                        <Badge 
                          variant="outline" 
                          className={
                            transaction.priority === 'high' || transaction.priority === 'urgent'
                              ? 'border-red-200 text-red-700'
                              : transaction.priority === 'medium'
                              ? 'border-yellow-200 text-yellow-700'
                              : 'border-green-200 text-green-700'
                          }
                        >
                          {transaction.priority}
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(transaction.expected_closing_date)}
                    </TableCell>
                    
                    <TableCell>
                      {transaction.contact ? (
                        <div>
                          <div className="font-medium">{transaction.contact.name}</div>
                          {transaction.contact.email && (
                            <div className="text-sm text-gray-500">
                              {transaction.contact.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin contacto</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Gestionar documentos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay transacciones</h3>
            <p className="text-sm">
              Las transacciones se crearán automáticamente cuando se aprueben propuestas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
