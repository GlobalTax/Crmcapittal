import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, FileText, Mail, Phone, Edit2, Eye } from 'lucide-react';
import { MandateTarget, MandateDocument } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { InlineEditCell } from './InlineEditCell';
import { TargetProgressBar } from './TargetProgressBar';

interface TargetDataTableProps {
  targets: MandateTarget[];
  documents: MandateDocument[];
  onEditTarget: (target: MandateTarget) => void;
  onViewDocuments: (target: MandateTarget) => void;
}

export const TargetDataTable = ({ 
  targets, 
  documents, 
  onEditTarget, 
  onViewDocuments 
}: TargetDataTableProps) => {
  const { updateTarget } = useBuyingMandates();

  const formatCurrency = (amount?: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const handleInlineUpdate = async (targetId: string, field: string, value: string | number) => {
    try {
      await updateTarget(targetId, { [field]: value });
    } catch (error) {
      console.error('Error updating target:', error);
    }
  };

  const handleStatusChange = async (targetId: string, status: MandateTarget['status']) => {
    try {
      await updateTarget(targetId, { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const markAsContacted = async (targetId: string, method: string) => {
    try {
      await updateTarget(targetId, {
        contacted: true,
        contact_date: new Date().toISOString().split('T')[0],
        contact_method: method,
        status: 'contacted',
      });
    } catch (error) {
      console.error('Error marking as contacted:', error);
    }
  };

  const getTargetDocuments = (targetId: string) => {
    return documents.filter(doc => doc.target_id === targetId);
  };

  if (targets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay targets añadidos aún</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Empresa</TableHead>
            <TableHead className="w-[200px]">Contacto</TableHead>
            <TableHead className="w-[150px]">Financials</TableHead>
            <TableHead className="w-[180px]">Estado & Progreso</TableHead>
            <TableHead className="w-[120px]">Contactado</TableHead>
            <TableHead className="w-[100px]">Documentos</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targets.map((target) => {
            const targetDocs = getTargetDocuments(target.id);
            
            return (
              <TableRow key={target.id}>
                <TableCell>
                  <div className="space-y-1">
                    <InlineEditCell
                      value={target.company_name}
                      onSave={(value) => handleInlineUpdate(target.id, 'company_name', value)}
                      className="font-medium"
                    />
                    <div className="flex space-x-2">
                      <InlineEditCell
                        value={target.sector}
                        placeholder="Sector"
                        onSave={(value) => handleInlineUpdate(target.id, 'sector', value)}
                        className="text-xs text-muted-foreground"
                      />
                      <span className="text-xs text-muted-foreground">•</span>
                      <InlineEditCell
                        value={target.location}
                        placeholder="Ubicación"
                        onSave={(value) => handleInlineUpdate(target.id, 'location', value)}
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <InlineEditCell
                      value={target.contact_name}
                      placeholder="Nombre contacto"
                      onSave={(value) => handleInlineUpdate(target.id, 'contact_name', value)}
                      className="text-sm"
                    />
                    <InlineEditCell
                      value={target.contact_email}
                      placeholder="email@empresa.com"
                      type="email"
                      onSave={(value) => handleInlineUpdate(target.id, 'contact_email', value)}
                      className="text-xs text-muted-foreground"
                    />
                    <InlineEditCell
                      value={target.contact_phone}
                      placeholder="Teléfono"
                      onSave={(value) => handleInlineUpdate(target.id, 'contact_phone', value)}
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Facturación:</div>
                    <InlineEditCell
                      value={target.revenues}
                      type="number"
                      placeholder="0"
                      onSave={(value) => handleInlineUpdate(target.id, 'revenues', value)}
                      className="text-sm"
                    />
                    <div className="text-xs text-muted-foreground">EBITDA:</div>
                    <InlineEditCell
                      value={target.ebitda}
                      type="number"
                      placeholder="0"
                      onSave={(value) => handleInlineUpdate(target.id, 'ebitda', value)}
                      className="text-sm"
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-3">
                    <Select
                      value={target.status}
                      onValueChange={(value) => handleStatusChange(target.id, value as MandateTarget['status'])}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="contacted">Contactado</SelectItem>
                        <SelectItem value="in_analysis">En Análisis</SelectItem>
                        <SelectItem value="interested">Interesado</SelectItem>
                        <SelectItem value="nda_signed">NDA Firmado</SelectItem>
                        <SelectItem value="rejected">Rechazado</SelectItem>
                        <SelectItem value="closed">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                    <TargetProgressBar 
                      status={target.status} 
                      contacted={target.contacted}
                    />
                  </div>
                </TableCell>

                <TableCell>
                  {target.contacted ? (
                    <div className="space-y-1">
                      <div className="text-sm text-green-600 font-medium">✓ Contactado</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(target.contact_date)}
                      </div>
                      {target.contact_method && (
                        <div className="text-xs text-muted-foreground">
                          via {target.contact_method}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsContacted(target.id, 'email')}
                        className="w-full justify-start"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsContacted(target.id, 'phone')}
                        className="w-full justify-start"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Teléfono
                      </Button>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDocuments(target)}
                      className="flex items-center space-x-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>{targetDocs.length}</span>
                    </Button>
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
                      <DropdownMenuItem onClick={() => onEditTarget(target)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewDocuments(target)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle Completo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};