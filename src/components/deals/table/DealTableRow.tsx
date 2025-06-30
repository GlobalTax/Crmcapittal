
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Euro, Building2, User, Calendar, Activity, Eye } from "lucide-react";
import { Deal } from "@/types/Deal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";

interface DealTableRowProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
}

export const DealTableRow = ({ deal, onEdit, onDelete }: DealTableRowProps) => {
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

  const getDaysInPipeline = (createdAt: string) => {
    const days = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este deal?')) {
      onDelete(deal.id);
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <div className="font-medium text-blue-600 hover:text-blue-800">
            <Link to={`/deals/${deal.id}`} className="hover:underline">
              {deal.deal_name}
            </Link>
          </div>
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
        ) : deal.contact_name ? (
          <div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              {deal.contact_name}
            </div>
            {deal.contact_email && (
              <div className="text-sm text-muted-foreground">
                {deal.contact_email}
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
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          {deal.deal_owner || 'Sin asignar'}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center text-sm text-muted-foreground">
          <Activity className="h-4 w-4 mr-2" />
          {format(new Date(deal.updated_at), 'dd/MM/yyyy', { locale: es })}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            {getDaysInPipeline(deal.created_at)} días
          </span>
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
            <DropdownMenuItem asChild>
              <Link to={`/deals/${deal.id}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(deal)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
