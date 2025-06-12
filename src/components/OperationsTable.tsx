
import { Operation } from "@/types/Operation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getOperationTypeLabel, formatFinancialValue } from "@/utils/operationHelpers";
import { FavoriteButton } from "./FavoriteButton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface OperationsTableProps {
  operations: Operation[];
}

export const OperationsTable = ({ operations }: OperationsTableProps) => {
  const handleContact = (operation: Operation) => {
    console.log("Contact for operation:", operation.company_name);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Sector</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Importe</TableHead>
          <TableHead>Facturación</TableHead>
          <TableHead>EBITDA</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Gestor</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {operations.map((operation) => (
          <TableRow key={operation.id}>
            <TableCell className="font-medium">{operation.company_name}</TableCell>
            <TableCell>{operation.sector}</TableCell>
            <TableCell>{getOperationTypeLabel(operation.operation_type)}</TableCell>
            <TableCell>{formatFinancialValue(operation.amount)}</TableCell>
            <TableCell>{formatFinancialValue(operation.revenue)}</TableCell>
            <TableCell>{formatFinancialValue(operation.ebitda)}</TableCell>
            <TableCell>{operation.location}</TableCell>
            <TableCell>
              {operation.manager ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={operation.manager.photo} alt={operation.manager.name} />
                    <AvatarFallback className="text-xs">
                      {operation.manager.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{operation.manager.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Sin asignar</span>
              )}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(operation.status)}>
                {operation.status === 'available' ? 'Disponible' : 
                 operation.status === 'pending_review' ? 'Pendiente' : 'Cerrada'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <FavoriteButton operationId={operation.id} />
                <Button 
                  onClick={() => handleContact(operation)}
                  size="sm" 
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Contactar
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
