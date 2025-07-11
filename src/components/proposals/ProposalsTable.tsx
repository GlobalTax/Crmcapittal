
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Proposal } from '@/types/Proposal';
import { MoreHorizontal, Eye, Edit, CheckCircle, Building, FileText } from 'lucide-react';
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
  getStatusLabel?: (status: string) => string;
}

export const ProposalsTable: React.FC<ProposalsTableProps> = ({
  proposals,
  getStatusIcon,
  getStatusColor,
  getStatusLabel
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Expiró hace ${Math.abs(diffDays)} días`;
    if (diffDays === 0) return 'Expira hoy';
    if (diffDays === 1) return 'Expira mañana';
    if (diffDays <= 7) return `Expira en ${diffDays} días`;
    return formatDate(dateString);
  };

  const handleApprove = (proposalId: string) => {
    toast({
      title: "Propuesta aprobada",
      description: "La propuesta ha sido marcada como aprobada"
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Propuestas ({proposals.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {proposals.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Propuesta</TableHead>
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right">Valor</TableHead>
                  <TableHead className="font-semibold">Área</TableHead>
                  <TableHead className="font-semibold">Vencimiento</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow 
                    key={proposal.id} 
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
                          {proposal.title}
                        </p>
                        {proposal.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {proposal.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {proposal.proposal_number || `#${proposal.id.slice(0, 8)}`}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      {proposal.contact ? (
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {proposal.contact.name}
                          </p>
                          {proposal.contact.email && (
                            <p className="text-sm text-muted-foreground">
                              {proposal.contact.email}
                            </p>
                          )}
                          {proposal.company && (
                            <p className="text-xs text-muted-foreground">
                              {proposal.company.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">
                          Sin contacto asignado
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <Badge 
                        className={`${getStatusColor(proposal.status)} border font-medium`}
                        variant="secondary"
                      >
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(proposal.status)}
                          <span>{getStatusLabel ? getStatusLabel(proposal.status) : proposal.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="py-4 text-right">
                      <div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(proposal.total_amount, proposal.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {proposal.proposal_type === 'punctual' ? 'Puntual' : 'Recurrente'}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      {proposal.practice_area ? (
                        <Badge 
                          variant="outline" 
                          className="font-medium"
                          style={{ 
                            borderColor: proposal.practice_area.color,
                            color: proposal.practice_area.color,
                            backgroundColor: `${proposal.practice_area.color}10`
                          }}
                        >
                          {proposal.practice_area.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No especificada
                        </span>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="text-sm">
                        {proposal.valid_until ? (
                          <>
                            <p className="font-medium text-foreground">
                              {formatDate(proposal.valid_until)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getRelativeDate(proposal.valid_until)}
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Sin vencimiento</span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">
                          {formatDate(proposal.created_at)}
                        </p>
                        {proposal.approved_at && (
                          <p className="text-xs text-green-600">
                            Aprobada: {formatDate(proposal.approved_at)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar propuesta
                          </DropdownMenuItem>
                          {proposal.status === 'sent' && (
                            <DropdownMenuItem 
                              className="cursor-pointer text-green-600"
                              onClick={() => handleApprove(proposal.id)}
                            >
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
          <div className="text-center py-16 px-6">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sin propuestas aún</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Cuando crees propuestas, aparecerán aquí. Comienza creando tu primera propuesta profesional.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
