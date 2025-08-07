import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Building2, Calendar, Phone, Mail, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { MiniPipelineComponent } from './MiniPipelineComponent';
import { TransaccionSmartAlerts } from './TransaccionSmartAlerts';
import { InlineTransaccionDetail } from './InlineTransaccionDetail';
import { useTransaccionesOptimized } from '@/hooks/useTransaccionesOptimized';
import { Transaccion } from '@/types/Transaccion';

export const HybridTransaccionesList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  
  const { filteredTransacciones: transacciones, isLoading: loading, updateTransaccionStage } = useTransaccionesOptimized({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getValueColor = (value: number) => {
    if (value >= 1000000) return 'text-green-600 dark:text-green-400 font-semibold';
    if (value >= 500000) return 'text-blue-600 dark:text-blue-400 font-medium';
    return 'text-muted-foreground';
  };

  const getDaysInStage = (updatedAt: string) => {
    const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatProximaActividad = (proximaActividad?: string) => {
    if (!proximaActividad) return 'Sin actividad programada';
    
    // Simple parsing - en implementación real sería más sofisticado
    if (proximaActividad.toLowerCase().includes('call')) {
      return `📞 ${proximaActividad}`;
    }
    if (proximaActividad.toLowerCase().includes('meeting') || proximaActividad.toLowerCase().includes('reunión')) {
      return `🤝 ${proximaActividad}`;
    }
    if (proximaActividad.toLowerCase().includes('email') || proximaActividad.toLowerCase().includes('mail')) {
      return `📧 ${proximaActividad}`;
    }
    return `📝 ${proximaActividad}`;
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? transacciones.map(t => t.id) : []);
  };

  const handleRowClick = (transaccion: Transaccion) => {
    setExpandedRowId(expandedRowId === transaccion.id ? null : transaccion.id);
  };

  const handleNameClick = (transaccionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/transacciones/${transaccionId}`);
  };

  const handleStageChange = async (transaccionId: string, newStageId: string) => {
    try {
      await updateTransaccionStage(transaccionId, newStageId);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Operations Bar */}
      {selectedIds.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.length} transacciones seleccionadas
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Mover a etapa</Button>
                <Button variant="outline" size="sm">Asignar propietario</Button>
                <Button variant="outline" size="sm">Exportar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla Híbrida */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === transacciones.length && transacciones.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-80">Transacción</TableHead>
                <TableHead className="w-60">Cliente</TableHead>
                <TableHead className="w-32">Valor</TableHead>
                <TableHead className="w-40">Estado</TableHead>
                <TableHead className="w-60">Próx. Acción</TableHead>
                <TableHead className="w-32">Owner</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacciones.map((transaccion) => (
                <React.Fragment key={transaccion.id}>
                  <TableRow 
                    className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                      expandedRowId === transaccion.id ? 'bg-accent/30' : ''
                    }`}
                    onClick={() => handleRowClick(transaccion)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(transaccion.id)}
                        onCheckedChange={(checked) => handleRowSelect(transaccion.id, !!checked)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-medium text-foreground truncate hover:text-primary cursor-pointer transition-colors"
                            onClick={(e) => handleNameClick(transaccion.id, e)}
                            title="Ir al análisis completo"
                          >
                            {transaccion.nombre_transaccion}
                          </span>
                          <TransaccionSmartAlerts transaccion={transaccion} />
                        </div>
                        <MiniPipelineComponent 
                          currentStage={transaccion.stage}
                          onStageChange={(stageId) => handleStageChange(transaccion.id, stageId)}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {transaccion.company?.name?.substring(0, 2).toUpperCase() || 'CO'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground truncate">
                            {transaccion.company?.name || 'Sin empresa'}
                          </p>
                          {transaccion.sector && (
                            <Badge variant="outline" className="text-xs">
                              {transaccion.sector}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className={getValueColor(transaccion.valor_transaccion || 0)}>
                        {formatCurrency(transaccion.valor_transaccion || 0)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {transaccion.stage?.name || 'Sin etapa'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getDaysInStage(transaccion.updated_at)} días en etapa
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-foreground">
                          {formatProximaActividad(transaccion.proxima_actividad)}
                        </p>
                        {transaccion.fecha_cierre && (
                          <p className="text-xs text-muted-foreground">
                            Cierre: {new Date(transaccion.fecha_cierre).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {transaccion.propietario_transaccion?.substring(0, 2).toUpperCase() || 'UN'}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Programar call
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Ver documentos
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Inline Detail Panel */}
                  {expandedRowId === transaccion.id && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0">
                        <InlineTransaccionDetail transaccion={transaccion} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>

          {transacciones.length === 0 && (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No hay transacciones</h3>
              <p className="text-muted-foreground">
                No se encontraron transacciones que coincidan con los filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};