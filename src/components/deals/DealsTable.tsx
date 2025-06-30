
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Euro, Building2, User, Calendar } from "lucide-react";
import { Deal } from "@/types/Deal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditDealDialog } from "./EditDealDialog";

interface DealsTableProps {
  deals: Deal[];
  onUpdate: (id: string, updates: Partial<Deal>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export const DealsTable = ({ deals, onUpdate, onDelete }: DealsTableProps) => {
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja': return "bg-gray-100 text-gray-800";
      case 'media': return "bg-yellow-100 text-yellow-800";
      case 'alta': return "bg-orange-100 text-orange-800";
      case 'urgente': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleDelete = async (dealId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este deal?')) {
      await onDelete(dealId);
    }
  };

  if (deals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron deals
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{deal.deal_name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {deal.deal_type}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    {deal.company_name || '-'}
                  </div>
                </TableCell>
                
                <TableCell>
                  {deal.contact ? (
                    <div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {deal.contact.name}
                      </div>
                      {deal.contact.email && (
                        <div className="text-sm text-muted-foreground">
                          {deal.contact.email}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {deal.stage ? (
                    <Badge 
                      variant="outline" 
                      style={{ 
                        backgroundColor: deal.stage.color + '20', 
                        borderColor: deal.stage.color,
                        color: deal.stage.color 
                      }}
                    >
                      {deal.stage.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Sin etapa</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <Badge className={getPriorityColor(deal.priority)} variant="outline">
                    {deal.priority}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center font-medium">
                    <Euro className="h-4 w-4 mr-1" />
                    {formatCurrency(deal.deal_value)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(deal.created_at), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingDeal(deal)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(deal.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

      {editingDeal && (
        <EditDealDialog
          deal={editingDeal}
          open={true}
          onOpenChange={(open) => !open && setEditingDeal(null)}
          onSuccess={async (updates) => {
            await onUpdate(editingDeal.id, updates);
            setEditingDeal(null);
          }}
        />
      )}
    </>
  );
};
