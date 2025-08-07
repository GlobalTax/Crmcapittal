import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react';
import { Lead } from '@/types/Lead';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FixedSizeList as List } from 'react-window';

interface LeadsTableProps {
  data: Lead[];
  isLoading?: boolean;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ data, isLoading }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700';
      case 'QUALIFIED':
        return 'bg-green-50 text-green-700';
      case 'CONVERTED':
        return 'bg-emerald-50 text-emerald-700';
      case 'LOST':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return 'Nuevo';
      case 'QUALIFIED':
        return 'Calificado';
      case 'CONVERTED':
        return 'Convertido';
      case 'LOST':
        return 'Perdido';
      default:
        return status || 'Sin estado';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <div className="h-10 bg-muted/50 rounded animate-pulse" />
        <div className="border rounded">
          <div className="h-10 bg-muted/50 animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 border-t bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No hay leads disponibles</p>
      </div>
    );
  }

  if (data.length > 100) {
    const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
      const lead = data[index];
      return (
        <div style={style} className="flex items-center border-b hover:bg-muted/50 px-4">
          <div className="grid grid-cols-12 gap-4 w-full items-center">
            <div className="col-span-3">
              <div className="font-medium text-gray-900">{lead.name}</div>
              <div className="flex items-center gap-2 mt-1">
                {lead.email && <Mail className="h-3 w-3 text-muted-foreground" />}
                {lead.phone && <Phone className="h-3 w-3 text-muted-foreground" />}
              </div>
            </div>
            <div className="col-span-3">{lead.company || '-'}</div>
            <div className="col-span-2">
              <Badge variant="secondary" className={getStatusColor(lead.status)}>
                {getStatusLabel(lead.status)}
              </Badge>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-muted-foreground">{lead.source || '-'}</span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Calendar className="h-3 w-3" />
                {format(new Date(lead.created_at), 'dd MMM', { locale: es })}
              </div>
            </div>
            <div className="col-span-1 text-right">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    });

    return (
      <div className="p-4 rounded-md border">
        <div className="bg-muted/50 border-b">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 font-medium text-sm">
            <div className="col-span-3">Contacto</div>
            <div className="col-span-3">Empresa</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2">Fuente</div>
            <div className="col-span-1">Creado</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        <List height={600} width="100%" itemCount={data.length} itemSize={72} overscanCount={5}>
          {Row}
        </List>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contacto</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fuente</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {lead.name}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {lead.email && (
                      <a 
                        href={`mailto:${lead.email}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Mail className="h-3 w-3" />
                      </a>
                    )}
                    {lead.phone && (
                      <a 
                        href={`tel:${lead.phone}`}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-gray-900">{lead.company || '-'}</span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(lead.status)}
                >
                  {getStatusLabel(lead.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-gray-600 text-sm">{lead.source || '-'}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(lead.created_at), 'dd MMM', { locale: es })}
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