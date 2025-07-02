
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal, Send, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Proposal } from '@/types/Proposal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };

  const handleViewProposal = (proposal: Proposal) => {
    console.log('Ver propuesta:', proposal.id);
    // TODO: Implementar vista de propuesta
  };

  const handleEditProposal = (proposal: Proposal) => {
    console.log('Editar propuesta:', proposal.id);
    // TODO: Implementar edición de propuesta
  };

  const handleSendProposal = (proposal: Proposal) => {
    console.log('Enviar propuesta:', proposal.id);
    // TODO: Implementar envío de propuesta
  };

  const handleDownloadProposal = (proposal: Proposal) => {
    console.log('Descargar propuesta:', proposal.id);
    // TODO: Implementar descarga de PDF
  };

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay propuestas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primera propuesta de honorarios.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Propuestas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente/Empresa</TableHead>
              <TableHead>Área de Práctica</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Válida Hasta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell className="font-medium">
                  {proposal.title}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {proposal.contact && (
                      <div className="text-sm font-medium">{proposal.contact.name}</div>
                    )}
                    {proposal.company && (
                      <div className="text-xs text-gray-500">{proposal.company.name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {proposal.practice_area && (
                    <Badge 
                      variant="outline" 
                      style={{ backgroundColor: proposal.practice_area.color + '20', borderColor: proposal.practice_area.color }}
                    >
                      {proposal.practice_area.name}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {proposal.total_amount ? (
                    <span className="font-medium">
                      €{proposal.total_amount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(proposal.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(proposal.status)}
                      {getStatusLabel(proposal.status)}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {proposal.valid_until ? (
                    format(new Date(proposal.valid_until), 'dd/MM/yyyy', { locale: es })
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewProposal(proposal)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {proposal.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handleSendProposal(proposal)}>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDownloadProposal(proposal)}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
