import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Building2, Users, Euro, MapPin } from 'lucide-react';
import { Company } from '@/types/Company';

interface CompaniesTableProps {
  data: Company[];
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cliente':
        return 'bg-green-50 text-green-700';
      case 'prospecto':
        return 'bg-blue-50 text-blue-700';
      case 'partner':
        return 'bg-purple-50 text-purple-700';
      case 'inactive':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'cliente':
        return 'Cliente';
      case 'prospecto':
        return 'Prospecto';
      case 'partner':
        return 'Partner';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
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
        <p className="text-gray-600">No hay empresas disponibles</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Contactos</TableHead>
            <TableHead>Facturación</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((company) => (
            <TableRow key={company.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{company.name}</span>
                    {company.city && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{company.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(company.company_status)}
                >
                  {getStatusLabel(company.company_status)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-gray-600 text-sm">{company.industry || '-'}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-3 w-3" />
                  <span className="text-sm">{company.contacts_count || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-gray-600">
                  <Euro className="h-3 w-3" />
                  <span className="text-sm">{formatRevenue(company.annual_revenue)}</span>
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