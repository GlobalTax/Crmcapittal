import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collaborator, CollaboratorType } from '@/types/Collaborator';
import { MoreHorizontal, Eye, Edit, Trash2, Users, FileText, Send } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AgreementViewDialog } from './AgreementViewDialog';
import { SecureField } from '@/components/ui/SecureField';

interface CollaboratorsTableProps {
  collaborators: Collaborator[];
  onEditCollaborator: (collaborator: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
  onGenerateAgreement: (collaborator: Collaborator) => void;
}

const collaboratorTypeLabels: Record<CollaboratorType, string> = {
  referente: 'Referente',
  partner_comercial: 'Partner Comercial',
  agente: 'Agente',
  freelancer: 'Freelancer'
};

const getTypeColor = (type: CollaboratorType) => {
  switch (type) {
    case 'referente':
      return 'bg-blue-100 text-blue-800';
    case 'partner_comercial':
      return 'bg-green-100 text-green-800';
    case 'agente':
      return 'bg-purple-100 text-purple-800';
    case 'freelancer':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getAgreementStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'generated':
      return 'bg-blue-100 text-blue-800';
    case 'sent':
      return 'bg-purple-100 text-purple-800';
    case 'signed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getAgreementStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'generated':
      return 'Generado';
    case 'sent':
      return 'Enviado';
    case 'signed':
      return 'Firmado';
    default:
      return 'Desconocido';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const CollaboratorsTable: React.FC<CollaboratorsTableProps> = ({
  collaborators,
  onEditCollaborator,
  onDeleteCollaborator,
  onGenerateAgreement
}) => {
  const [viewingAgreement, setViewingAgreement] = useState<Collaborator | null>(null);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span>Lista de Colaboradores</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {collaborators.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Comisión %</TableHead>
                  <TableHead>Comisión Base</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acuerdo</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.map((collaborator) => (
                  <TableRow key={collaborator.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {collaborator.name}
                      <SecureField
                        tableName="collaborators"
                        fieldName="notes"
                        value={collaborator.notes}
                        fallback={null}
                      >
                        {({ isVisible, maskedValue }) => (
                          isVisible && collaborator.notes ? (
                            <div className="text-sm text-muted-foreground mt-1">
                              {maskedValue.slice(0, 50)}...
                            </div>
                          ) : null
                        )}
                      </SecureField>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={getTypeColor(collaborator.collaborator_type)}>
                        {collaboratorTypeLabels[collaborator.collaborator_type]}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <SecureField
                        tableName="collaborators"
                        fieldName="email"
                        value={collaborator.email}
                        fallback={<span className="text-muted-foreground">-</span>}
                      >
                        {({ isVisible, maskedValue }) => (
                          isVisible && collaborator.email ? (
                            <div className="text-sm">{maskedValue}</div>
                          ) : null
                        )}
                      </SecureField>
                      <SecureField
                        tableName="collaborators"
                        fieldName="phone"
                        value={collaborator.phone}
                        fallback={null}
                      >
                        {({ isVisible, maskedValue }) => (
                          isVisible && collaborator.phone ? (
                            <div className="text-sm text-muted-foreground">{maskedValue}</div>
                          ) : null
                        )}
                      </SecureField>
                      {!collaborator.email && !collaborator.phone && (
                        <span className="text-muted-foreground">Sin contacto</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <SecureField
                        tableName="collaborators"
                        fieldName="commission_percentage"
                        value={collaborator.commission_percentage}
                        renderAs="percentage"
                        className="font-medium"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <SecureField
                        tableName="collaborators"
                        fieldName="base_commission"
                        value={collaborator.base_commission}
                        renderAs="currency"
                        className="font-medium"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={collaborator.is_active ? "default" : "secondary"}>
                        {collaborator.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <SecureField
                        tableName="collaborators"
                        fieldName="agreement_status"
                        value={collaborator.agreement_status}
                      >
                        {({ isVisible, originalValue }) => (
                          isVisible ? (
                            <Badge className={getAgreementStatusColor(originalValue)}>
                              {getAgreementStatusLabel(originalValue)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )
                        )}
                      </SecureField>
                    </TableCell>
                    
                    <TableCell>
                      {formatDate(collaborator.created_at)}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log('Ver detalles', collaborator.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          {collaborator.agreement_status === 'pending' && (
                            <DropdownMenuItem onClick={() => onGenerateAgreement(collaborator)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Generar Acuerdo
                            </DropdownMenuItem>
                          )}
                          {collaborator.agreement_id && collaborator.agreement_status !== 'pending' && (
                            <DropdownMenuItem onClick={() => setViewingAgreement(collaborator)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Acuerdo
                            </DropdownMenuItem>
                          )}
                          {collaborator.agreement_status === 'generated' && (
                            <DropdownMenuItem onClick={() => console.log('Enviar acuerdo', collaborator.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Acuerdo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onEditCollaborator(collaborator)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteCollaborator(collaborator.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
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
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay colaboradores</h3>
            <p className="text-sm">
              Los colaboradores aparecerán aquí cuando se creen
            </p>
          </div>
        )}
      </CardContent>
    </Card>

    <AgreementViewDialog
      collaborator={viewingAgreement}
      isOpen={!!viewingAgreement}
      onClose={() => setViewingAgreement(null)}
    />
  </>);
};