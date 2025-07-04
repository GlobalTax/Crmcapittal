
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Proposal } from '@/types/Proposal';
import { MoreHorizontal, Eye, Edit, CheckCircle, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProposalsTableProps {
  proposals: Proposal[];
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}

export const ProposalsTable: React.FC<ProposalsTableProps> = ({
  proposals,
  getStatusIcon,
  getStatusColor
}) => {
  const { toast } = useToast();

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
          <Building className="h-5 w-5 text-blue-600" />
          <span>Lista de Propuestas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {proposals.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Área de Práctica</TableHead>
                  <TableHead>Válida Hasta</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {proposal.title}
                      {proposal.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {proposal.description.slice(0, 100)}...
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {proposal.contact ? (
                        <div>
                          <div className="font-medium">{proposal.contact.name}</div>
                          {proposal.contact.email && (
                            <div className="text-sm text-gray-500">
                              {proposal.contact.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin contacto</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getStatusColor(proposal.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(proposal.status)}
                          <span>{proposal.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(proposal.total_amount, proposal.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {proposal.proposal_type}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {proposal.practice_area ? (
                        <Badge 
                          variant="outline" 
                          style={{ 
                            borderColor: proposal.practice_area.color,
                            color: proposal.practice_area.color 
                          }}
                        >
                          {proposal.practice_area.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No especificada</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(proposal.valid_until)}
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(proposal.created_at)}
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
                            {proposal.status === 'sent' && (
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como aprobada
                              </DropdownMenuItem>
                            )}
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
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay propuestas</h3>
            <p className="text-sm">
              Las propuestas aparecerán aquí cuando se creen
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
