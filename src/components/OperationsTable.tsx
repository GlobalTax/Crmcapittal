
import React from 'react';
import { Operation } from '@/types/Operation';
import { FavoriteButton } from '@/components/FavoriteButton';
import { OperationCardActions } from '@/components/OperationCardActions';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStatusColor, getStatusLabel, getOperationTypeLabel, formatFinancialValue } from '@/utils/operationHelpers';

interface OperationsTableProps {
  operations: Operation[];
  onToggleFavorite: (operationId: string) => void;
  isFavorite: (operationId: string) => boolean;
}

export const OperationsTable = ({ operations }: OperationsTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12"></TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Gestor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Inversión</TableHead>
            <TableHead>Facturación</TableHead>
            <TableHead>Crecimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation) => (
            <TableRow key={operation.id} className="hover:bg-gray-50 transition-colors">
              <TableCell>
                <FavoriteButton operationId={operation.id} />
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {operation.company_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{operation.company_name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {operation.description}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {operation.manager ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={operation.manager.photo} alt={operation.manager.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {operation.manager.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{operation.manager.name}</div>
                      <div className="text-xs text-gray-500">{operation.manager.position}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No asignado</span>
                )}
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {getOperationTypeLabel(operation.operation_type)}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="text-sm text-gray-900">{operation.sector}</span>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-600">
                  {operation.location}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm font-medium">
                  €{formatFinancialValue(operation.amount)}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-900">
                  €{formatFinancialValue(operation.revenue)}
                </div>
              </TableCell>

              <TableCell>
                {operation.annual_growth_rate ? (
                  <div className="text-sm">
                    <span className="font-medium text-green-600">
                      +{operation.annual_growth_rate}%
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </TableCell>

              <TableCell>
                <Badge className={getStatusColor(operation.status)}>
                  {getStatusLabel(operation.status)}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-600">
                  {new Date(operation.date).toLocaleDateString('es-ES')}
                </div>
              </TableCell>

              <TableCell>
                <OperationCardActions
                  operation={operation}
                  size="sm"
                  variant="minimal"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
