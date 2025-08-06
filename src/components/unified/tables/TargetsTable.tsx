import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Target, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TargetsTableProps {
  data: MandateTarget[];
}

export const TargetsTable: React.FC<TargetsTableProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-50 text-blue-700';
      case 'contacted':
        return 'bg-amber-50 text-amber-700';
      case 'in_analysis':
        return 'bg-purple-50 text-purple-700';
      case 'interested':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'contacted':
        return 'Contactado';
      case 'in_analysis':
        return 'En análisis';
      case 'interested':
        return 'Interesado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status || 'Sin estado';
    }
  };

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(revenue);
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No hay targets disponibles</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Facturación</TableHead>
            <TableHead>Añadido</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((target) => (
            <TableRow key={target.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-amber-50 rounded-lg">
                    <Target className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {target.company_name}
                    </span>
                    {target.sector && (
                      <span className="text-sm text-gray-600">
                        {target.sector}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {target.contact_name && (
                    <span className="font-medium text-gray-900">
                      {target.contact_name}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {target.contact_email && (
                      <a 
                        href={`mailto:${target.contact_email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Mail className="h-3 w-3" />
                      </a>
                    )}
                    {target.contact_phone && (
                      <a 
                        href={`tel:${target.contact_phone}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(target.status)}
                >
                  {getStatusLabel(target.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {target.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="text-sm">{target.location}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className="text-gray-600 text-sm">
                  {formatRevenue(target.revenues)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(target.created_at), 'dd MMM', { locale: es })}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};