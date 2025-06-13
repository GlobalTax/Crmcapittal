
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12"></TableHead>
              <TableHead className="min-w-[200px]">Empresa</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[120px]">Gestor</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Sector</TableHead>
              <TableHead className="hidden xl:table-cell">Ubicación</TableHead>
              <TableHead className="min-w-[100px]">Inversión</TableHead>
              <TableHead className="hidden lg:table-cell">Facturación</TableHead>
              <TableHead className="hidden xl:table-cell">Crecimiento</TableHead>
              <TableHead className="hidden sm:table-cell">Estado</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="w-24 sm:w-32">Acciones</TableHead>
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
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {operation.company_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{operation.company_name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">
                        {operation.description}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  {operation.manager ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={operation.manager.photo} alt={operation.manager.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {operation.manager.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate">{operation.manager.name}</div>
                        <div className="text-xs text-gray-500 truncate">{operation.manager.position}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">No asignado</span>
                  )}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">
                    {getOperationTypeLabel(operation.operation_type)}
                  </Badge>
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <span className="text-xs sm:text-sm text-gray-900">{operation.sector}</span>
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {operation.location}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="text-xs sm:text-sm font-medium">
                    €{formatFinancialValue(operation.amount)}
                  </div>
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <div className="text-xs sm:text-sm text-gray-900">
                    €{formatFinancialValue(operation.revenue)}
                  </div>
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  {operation.annual_growth_rate ? (
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-green-600">
                        +{operation.annual_growth_rate}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">N/A</span>
                  )}
                </TableCell>

                <TableCell className="hidden sm:table-cell">
                  <Badge className={getStatusColor(operation.status)}>
                    {getStatusLabel(operation.status)}
                  </Badge>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {new Date(operation.date).toLocaleDateString('es-ES')}
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
    </div>
  );
};
