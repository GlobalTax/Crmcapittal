
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
    <div className="border border-gray-100 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead className="hidden lg:table-cell">Gestor</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden sm:table-cell">Estado</TableHead>
            <TableHead>Inversión</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((operation, index) => (
            <TableRow key={operation.id}>
              <TableCell>
                <FavoriteButton operationId={operation.id} />
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {operation.company_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm">{operation.company_name}</div>
                    <div className="text-xs text-gray-500">{operation.description}</div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                {operation.manager ? (
                  <div className="text-sm text-gray-900">{operation.manager.name}</div>
                ) : (
                  <span className="text-gray-400 text-sm">No asignado</span>
                )}
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <span className="text-sm text-gray-600">
                  {getOperationTypeLabel(operation.operation_type)}
                </span>
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <span className="text-sm text-gray-600">
                  {getStatusLabel(operation.status)}
                </span>
              </TableCell>

              <TableCell>
                <div className="text-sm font-medium text-gray-900">
                  €{formatFinancialValue(operation.amount)}
                </div>
              </TableCell>

              <TableCell>
                <OperationCardActions operation={operation} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
