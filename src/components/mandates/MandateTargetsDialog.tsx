import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, Phone, Edit2 } from 'lucide-react';
import { BuyingMandate, MandateTarget, CreateMandateTargetData, MandateDocument } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { PipelineViewToggle } from './PipelineViewToggle';
import { MandateTargetPipeline } from './MandateTargetPipeline';
import { TargetDetailPanel } from './TargetDetailPanel';

interface MandateTargetsDialogProps {
  mandate: BuyingMandate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MandateTargetsDialog = ({ mandate, open, onOpenChange }: MandateTargetsDialogProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<MandateTarget | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<MandateTarget | null>(null);
  const [showTargetDetail, setShowTargetDetail] = useState(false);
  const { targets, documents, fetchTargets, fetchDocuments, createTarget, updateTarget, isLoading } = useBuyingMandates();
  const { mandateViewPreference, updateMandateViewPreference } = useViewPreferences();

  const [formData, setFormData] = useState<CreateMandateTargetData>({
    mandate_id: '',
    company_name: '',
    sector: '',
    location: '',
    revenues: undefined,
    ebitda: undefined,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  useEffect(() => {
    if (mandate && open) {
      fetchTargets(mandate.id);
      fetchDocuments(mandate.id);
      setFormData(prev => ({ ...prev, mandate_id: mandate.id }));
    }
  }, [mandate, open]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [MandateTargetsDialog] handleSubmit iniciado');
    console.log('📋 [MandateTargetsDialog] formData:', formData);
    console.log('📋 [MandateTargetsDialog] mandate:', mandate);
    console.log('📋 [MandateTargetsDialog] editingTarget:', editingTarget);

    // Validaciones básicas
    if (!formData.company_name?.trim()) {
      console.error('❌ [MandateTargetsDialog] Nombre de empresa requerido');
      return;
    }
    
    if (!mandate) {
      console.error('❌ [MandateTargetsDialog] Mandato no encontrado');
      return;
    }

    if (!formData.mandate_id) {
      console.error('❌ [MandateTargetsDialog] mandate_id faltante');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 [MandateTargetsDialog] Ejecutando operación...');
      
      if (editingTarget) {
        console.log('✏️ [MandateTargetsDialog] Editando target existente');
        await updateTarget(editingTarget.id, formData);
        setEditingTarget(null);
      } else {
        console.log('➕ [MandateTargetsDialog] Creando nuevo target');
        const result = await createTarget(formData);
        console.log('✅ [MandateTargetsDialog] Target creado:', result);
      }
      
      console.log('🎉 [MandateTargetsDialog] Operación completada exitosamente');
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('💥 [MandateTargetsDialog] Error al guardar target:', error);
      // El error ya es manejado en el hook useBuyingMandates
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mandate_id: mandate?.id || '',
      company_name: '',
      sector: '',
      location: '',
      revenues: undefined,
      ebitda: undefined,
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
    });
  };

  const startEdit = (target: MandateTarget) => {
    setEditingTarget(target);
    setFormData({
      mandate_id: target.mandate_id,
      company_name: target.company_name,
      sector: target.sector || '',
      location: target.location || '',
      revenues: target.revenues,
      ebitda: target.ebitda,
      contact_name: target.contact_name || '',
      contact_email: target.contact_email || '',
      contact_phone: target.contact_phone || '',
      notes: target.notes || '',
    });
    setShowAddForm(true);
  };

  const updateTargetStatus = async (targetId: string, status: MandateTarget['status']) => {
    await updateTarget(targetId, { status });
  };

  const markAsContacted = async (targetId: string, method: string) => {
    await updateTarget(targetId, {
      contacted: true,
      contact_date: new Date().toISOString().split('T')[0],
      contact_method: method,
      status: 'contacted',
    });
  };

  const handleTargetClick = (target: MandateTarget) => {
    setSelectedTarget(target);
    setShowTargetDetail(true);
  };

  const handleTargetUpdate = (updatedTarget: MandateTarget) => {
    if (mandate) {
      fetchTargets(mandate.id);
    }
  };

  const handleDocumentUploaded = () => {
    if (mandate) {
      fetchDocuments(mandate.id);
    }
  };

  const getStatusBadge = (status: MandateTarget['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      contacted: { label: 'Contactado', variant: 'default' as const },
      in_analysis: { label: 'En Análisis', variant: 'outline' as const },
      interested: { label: 'Interesado', variant: 'default' as const },
      nda_signed: { label: 'NDA Firmado', variant: 'default' as const },
      rejected: { label: 'Rechazado', variant: 'destructive' as const },
      closed: { label: 'Cerrado', variant: 'outline' as const },
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

  if (!mandate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Targets - {mandate.mandate_name}</DialogTitle>
          <DialogDescription>
            Cliente: {mandate.client_name} | Sectores: {mandate.target_sectors.join(', ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Target Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">
                {editingTarget ? 'Editar Target' : 'Añadir Nuevo Target'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nombre Empresa *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({...prev, company_name: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => setFormData(prev => ({...prev, sector: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="revenues">Facturación (€)</Label>
                    <Input
                      id="revenues"
                      type="number"
                      value={formData.revenues || ''}
                      onChange={(e) => setFormData(prev => ({...prev, revenues: e.target.value ? Number(e.target.value) : undefined}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ebitda">EBITDA (€)</Label>
                    <Input
                      id="ebitda"
                      type="number"
                      value={formData.ebitda || ''}
                      onChange={(e) => setFormData(prev => ({...prev, ebitda: e.target.value ? Number(e.target.value) : undefined}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_name">Contacto</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData(prev => ({...prev, contact_name: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({...prev, contact_email: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Teléfono</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({...prev, contact_phone: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTarget(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.company_name?.trim()}>
                    {isSubmitting ? 'Guardando...' : (editingTarget ? 'Actualizar' : 'Añadir')} Target
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {targets.length} targets encontrados
              </span>
              <PipelineViewToggle
                currentView={mandateViewPreference}
                onViewChange={updateMandateViewPreference}
              />
            </div>
            <Button 
              onClick={() => {
                setShowAddForm(true);
                setEditingTarget(null);
                resetForm();
              }}
              disabled={showAddForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Target
            </Button>
          </div>

          {/* Content based on view preference */}
          {mandateViewPreference === 'table' ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Financials</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Contactado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{target.company_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {target.sector} • {target.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {target.contact_name && (
                          <div>
                            <div className="text-sm">{target.contact_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {target.contact_email}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Rev: {formatCurrency(target.revenues)}</div>
                          <div>EBITDA: {formatCurrency(target.ebitda)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={target.status}
                          onValueChange={(value) => updateTargetStatus(target.id, value as MandateTarget['status'])}
                        >
                          <SelectTrigger className="w-32">
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
                      </TableCell>
                      <TableCell>
                        {target.contacted ? (
                          <div className="text-sm">
                            <div className="text-green-600">✓ Sí</div>
                            <div className="text-xs text-muted-foreground">
                              {target.contact_date && new Date(target.contact_date).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsContacted(target.id, 'email')}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsContacted(target.id, 'phone')}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTargetClick(target)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <MandateTargetPipeline
              targets={targets}
              documents={documents}
              onTargetClick={handleTargetClick}
            />
          )}
        </div>

        {/* Target Detail Panel */}
        <TargetDetailPanel
          target={selectedTarget}
          documents={documents}
          open={showTargetDetail}
          onOpenChange={setShowTargetDetail}
          onTargetUpdate={handleTargetUpdate}
          onDocumentUploaded={handleDocumentUploaded}
        />
      </DialogContent>
    </Dialog>
  );
};