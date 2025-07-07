import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';

interface MandatesTableProps {
  mandates: BuyingMandate[];
  onViewTargets: (mandate: BuyingMandate) => void;
}

export const MandatesTable = ({ mandates, onViewTargets }: MandatesTableProps) => {
  const { updateMandateStatus } = useBuyingMandates();

  const getStatusBadge = (status: BuyingMandate['status']) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mandato</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Sectores</TableHead>
            <TableHead>Rango Facturación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mandates.map((mandate) => (
            <TableRow key={mandate.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{mandate.mandate_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {mandate.target_locations.length > 0 && (
                      <>📍 {mandate.target_locations.slice(0, 2).join(', ')}</>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{mandate.client_name}</div>
                  <div className="text-sm text-muted-foreground">{mandate.client_contact}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {mandate.target_sectors.slice(0, 2).map((sector) => (
                    <Badge key={sector} variant="outline" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                  {mandate.target_sectors.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{mandate.target_sectors.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {mandate.min_revenue && mandate.max_revenue ? (
                    <>
                      {formatCurrency(mandate.min_revenue)} - {formatCurrency(mandate.max_revenue)}
                    </>
                  ) : mandate.min_revenue ? (
                    <>Desde {formatCurrency(mandate.min_revenue)}</>
                  ) : mandate.max_revenue ? (
                    <>Hasta {formatCurrency(mandate.max_revenue)}</>
                  ) : (
                    'No especificado'
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(mandate.status)}
              </TableCell>
              <TableCell>{formatDate(mandate.start_date)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewTargets(mandate)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Targets
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateMandateStatus(mandate.id, 
                        mandate.status === 'active' ? 'paused' : 'active'
                      )}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {mandate.status === 'active' ? 'Pausar' : 'Activar'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateMandateStatus(mandate.id, 'completed')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Marcar Completado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};