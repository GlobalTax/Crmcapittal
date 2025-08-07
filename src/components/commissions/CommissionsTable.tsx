import React, { useState } from 'react';
import { useCommissions, Commission } from '@/hooks/useCommissions';
import { CommissionDetails } from './CommissionDetails';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Download, 
  Check, 
  X, 
  Eye,
  Calendar,
  DollarSign,
  Calculator,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CommissionsTable = () => {
  const { commissions, loading, approveCommissions, updateCommissionStatus } = useCommissions();
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [calculationFilter, setCalculationFilter] = useState('all');
  const [marginFilter, setMarginFilter] = useState('all');
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredCommissions = commissions?.filter(commission => {
    const recipientName = commission.recipient_name || 
      (commission.recipient_type === 'collaborator' ? commission.collaborators?.name : 
       (commission.user_profiles ? `${commission.user_profiles.first_name || ''} ${commission.user_profiles.last_name || ''}`.trim() : ''));
    
    const calcDetails = (commission.calculation_details || {}) as Record<string, unknown>;
    const calculationType = calcDetails?.calculationType as string || 'gross';
    const netProfitMargin = calcDetails?.netProfitMargin as number || 0;
    
    const matchesSearch = recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.source_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || commission.source_type === sourceFilter;
    const matchesRecipient = recipientFilter === 'all' || commission.recipient_type === recipientFilter;
    const matchesCalculation = calculationFilter === 'all' || calculationType === calculationFilter;
    const matchesMargin = marginFilter === 'all' || 
      (marginFilter === 'low' && netProfitMargin < 20) ||
      (marginFilter === 'medium' && netProfitMargin >= 20 && netProfitMargin < 40) ||
      (marginFilter === 'high' && netProfitMargin >= 40);
    
    return matchesSearch && matchesStatus && matchesSource && matchesRecipient && matchesCalculation && matchesMargin;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCommissions(filteredCommissions?.map(c => c.id) || []);
    } else {
      setSelectedCommissions([]);
    }
  };

  const handleSelectCommission = (commissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedCommissions([...selectedCommissions, commissionId]);
    } else {
      setSelectedCommissions(selectedCommissions.filter(id => id !== commissionId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedCommissions.length === 0) return;
    await approveCommissions(selectedCommissions);
    setSelectedCommissions([]);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pendiente' },
      paid: { variant: 'default' as const, label: 'Pagado' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelado' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSourceBadge = (sourceType: string) => {
    const variants = {
      lead: { variant: 'outline' as const, label: 'Lead' },
      deal: { variant: 'outline' as const, label: 'Deal' },
      mandate: { variant: 'outline' as const, label: 'Mandato' },
      transaction: { variant: 'outline' as const, label: 'Transacción' }
    };
    
    const config = variants[sourceType as keyof typeof variants] || variants.deal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCalculationBadge = (calculationDetails: Record<string, unknown>) => {
    const calculationType = calculationDetails?.calculationType as string || 'gross';
    const variants = {
      gross: { variant: 'secondary' as const, label: 'Bruto', icon: DollarSign },
      net: { variant: 'outline' as const, label: 'Neto', icon: Calculator },
      mixed: { variant: 'default' as const, label: 'Mixto', icon: Calculator }
    };
    
    const config = variants[calculationType as keyof typeof variants] || variants.gross;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getMarginIndicator = (calculationDetails: Record<string, unknown>) => {
    const margin = calculationDetails?.netProfitMargin as number;
    if (!margin) return null;
    
    const isLowMargin = margin < 20;
    return (
      <div className={`flex items-center gap-1 text-xs ${isLowMargin ? 'text-warning' : 'text-muted-foreground'}`}>
        {isLowMargin && <AlertTriangle className="h-3 w-3" />}
        {margin.toFixed(1)}% margen
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Comisiones</CardTitle>
            <CardDescription>
              Administra y aprueba comisiones de colaboradores y empleados
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {selectedCommissions.length > 0 && (
              <Button onClick={handleBulkApprove} size="sm">
                <Check className="h-4 w-4 mr-2" />
                Aprobar ({selectedCommissions.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por destinatario o fuente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="deal">Deal</SelectItem>
              <SelectItem value="mandate">Mandato</SelectItem>
              <SelectItem value="transaction">Transacción</SelectItem>
            </SelectContent>
          </Select>
          <Select value={recipientFilter} onValueChange={setRecipientFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="collaborator">Colaboradores</SelectItem>
              <SelectItem value="employee">Empleados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={calculationFilter} onValueChange={setCalculationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Cálculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los cálculos</SelectItem>
              <SelectItem value="gross">Bruto</SelectItem>
              <SelectItem value="net">Neto</SelectItem>
              <SelectItem value="mixed">Mixto</SelectItem>
            </SelectContent>
          </Select>
          <Select value={marginFilter} onValueChange={setMarginFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Margen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los márgenes</SelectItem>
              <SelectItem value="low">Bajo (&lt;20%)</SelectItem>
              <SelectItem value="medium">Medio (20-40%)</SelectItem>
              <SelectItem value="high">Alto (&gt;40%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredCommissions?.length > 0 && 
                      selectedCommissions.length === filteredCommissions.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Cálculo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions?.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCommissions.includes(commission.id)}
                      onCheckedChange={(checked) => 
                        handleSelectCommission(commission.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {commission.recipient_name || 
                         (commission.recipient_type === 'collaborator' 
                           ? commission.collaborators?.name 
                           : commission.user_profiles 
                             ? `${commission.user_profiles.first_name || ''} ${commission.user_profiles.last_name || ''}`.trim()
                             : 'Sin nombre')}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {commission.recipient_type === 'collaborator' 
                          ? commission.collaborators?.collaborator_type || 'colaborador'
                          : 'empleado'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSourceBadge(commission.source_type || 'deal')}
                      {commission.calculation_details?.calculation_method === 'automatic' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                      {commission.source_name && (
                        <span className="text-sm text-muted-foreground">
                          {commission.source_name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        €{Number(commission.commission_amount).toLocaleString()}
                      </span>
                    </div>
                    {commission.commission_percentage && (
                      <p className="text-xs text-muted-foreground">
                        {commission.commission_percentage}%
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                       {getCalculationBadge(commission.calculation_details || {})}
                       {getMarginIndicator(commission.calculation_details || {})}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(commission.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(commission.created_at), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {commission.payment_due_date ? (
                      <span className="text-sm">
                        {format(new Date(commission.payment_due_date), 'dd MMM yyyy', { locale: es })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedCommission(commission);
                          setDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {commission.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => updateCommissionStatus(commission.id, 'paid')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => updateCommissionStatus(commission.id, 'cancelled')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {(!filteredCommissions || filteredCommissions.length === 0) && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron comisiones</p>
          </div>
        )}
      </CardContent>

      <CommissionDetails
        commission={selectedCommission}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </Card>
  );
};