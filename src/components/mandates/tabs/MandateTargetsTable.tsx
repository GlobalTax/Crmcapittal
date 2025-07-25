import React, { useMemo } from 'react';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Mail, Phone, MessageSquare, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddTargetCompanyDialog } from '@/components/mandates/AddTargetCompanyDialog';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MandateTargetsTableProps {
  mandate: BuyingMandate;
}

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending': return 'secondary';
    case 'contacted': return 'default';
    case 'in_analysis': return 'outline';
    case 'interested': return 'default';
    case 'nda_signed': return 'default';
    case 'rejected': return 'destructive';
    case 'closed': return 'default';
    default: return 'secondary';
  }
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    contacted: 'Contactado',
    in_analysis: 'En Análisis',
    interested: 'Interesado',
    nda_signed: 'NDA Firmado',
    rejected: 'Rechazado',
    closed: 'Cerrado'
  };
  return labels[status] || status;
};

export const MandateTargetsTable = ({ mandate }: MandateTargetsTableProps) => {
  const { targets, fetchTargets, updateTarget, deleteTarget } = useBuyingMandates();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Fetch targets when mandate changes
  useEffect(() => {
    if (mandate?.id) {
      fetchTargets(mandate.id);
    }
  }, [mandate?.id, fetchTargets]);

  // Filter targets based on search term, status, and sector
  const filteredTargets = useMemo(() => {
    return targets.filter(target => {
      const matchesSearch = !searchTerm || 
        target.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        target.sector?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || target.status === statusFilter;
      const matchesSector = sectorFilter === 'all' || target.sector === sectorFilter;
      
      return matchesSearch && matchesStatus && matchesSector;
    });
  }, [targets, searchTerm, statusFilter, sectorFilter]);

  // Get unique sectors for filter
  const sectors = useMemo(() => {
    const sectorSet = new Set(targets.map(target => target.sector).filter(Boolean));
    return Array.from(sectorSet).sort();
  }, [targets]);

  const handleContactTarget = async (target: MandateTarget) => {
    try {
      await updateTarget(target.id, { 
        contacted: true, 
        contact_date: new Date().toISOString(),
        status: 'contacted'
      });
      toast({
        title: "Target contactado",
        description: `${target.company_name} marcado como contactado`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el target",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTarget = async (target: MandateTarget) => {
    try {
      await deleteTarget(target.id);
      toast({
        title: "Target eliminado",
        description: `${target.company_name} eliminado del mandato`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el target",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Empresas Objetivo</h2>
          <p className="text-muted-foreground">
            {filteredTargets.length} de {targets.length} empresas
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Empresa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por empresa, contacto o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="in_analysis">En Análisis</SelectItem>
            <SelectItem value="interested">Interesado</SelectItem>
            <SelectItem value="nda_signed">NDA Firmado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los sectores</SelectItem>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Empresa</th>
                  <th className="p-4 font-medium">Sector</th>
                  <th className="p-4 font-medium">Ubicación</th>
                  <th className="p-4 font-medium">Facturación</th>
                  <th className="p-4 font-medium">EBITDA</th>
                  <th className="p-4 font-medium">Contacto</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Fecha Contacto</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      {targets.length === 0 
                        ? "No hay empresas objetivo en este mandato" 
                        : "No se encontraron empresas que coincidan con los filtros"
                      }
                    </td>
                  </tr>
                ) : (
                  filteredTargets.map((target) => (
                    <tr key={target.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{target.company_name}</div>
                          {target.notes && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {target.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{target.sector || '-'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{target.location || '-'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{formatCurrency(target.revenues)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{formatCurrency(target.ebitda)}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {target.contact_name && (
                            <div className="font-medium">{target.contact_name}</div>
                          )}
                          {target.contact_email && (
                            <div className="text-muted-foreground">{target.contact_email}</div>
                          )}
                          {target.contact_phone && (
                            <div className="text-muted-foreground">{target.contact_phone}</div>
                          )}
                          {!target.contact_name && !target.contact_email && !target.contact_phone && '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusBadgeVariant(target.status)}>
                          {getStatusLabel(target.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {target.contact_date 
                            ? new Date(target.contact_date).toLocaleDateString('es-ES')
                            : '-'
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              ⋮
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleContactTarget(target)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Marcar como contactado
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTarget(target)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Target Dialog */}
      <AddTargetCompanyDialog
        mandate={mandate}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onTargetAdded={() => {
          if (mandate?.id) {
            fetchTargets(mandate.id);
          }
        }}
      />
    </div>
  );
};