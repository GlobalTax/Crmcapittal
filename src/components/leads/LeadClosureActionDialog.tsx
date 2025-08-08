import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, FileText, Loader2, Target, TrendingUp, User } from 'lucide-react';
import type { Lead } from '@/types/Lead';
import type { CreateBuyingMandateData } from '@/types/BuyingMandate';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useValoraciones } from '@/hooks/useValoraciones';
import { toast } from 'sonner';
import { analyticsService } from '@/services/analyticsService';
import { useNavigate } from 'react-router-dom';

export type LeadClosureType = 'sell' | 'buy' | 'valuation';

interface LeadClosureActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onCreated?: (payload: { type: LeadClosureType; id: string; linkToLead?: boolean }) => void;
}

export const LeadClosureActionDialog: React.FC<LeadClosureActionDialogProps> = ({
  open,
  onOpenChange,
  lead,
  onCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [linkToLead, setLinkToLead] = useState(true);
  const [selectedType, setSelectedType] = useState<LeadClosureType>('valuation');
  const [recommendedType, setRecommendedType] = useState<LeadClosureType>('valuation');

  // Telemetría refs
  const openAtRef = useRef<number | null>(null);
  const decisionMadeRef = useRef(false);
  const selectionTrackedRef = useRef(false);
  const recommendedTrackedRef = useRef(false);

  // Navegación y estados auxiliares
  const navigate = useNavigate();
  const [existingLinked, setExistingLinked] = useState<{ id: string; type: LeadClosureType } | null>(null);
  const [ignoreExisting, setIgnoreExisting] = useState(false);

  // Campos inline cuando faltan datos mínimos
  const initialCompany = useMemo(
    () => (lead as any)?.company || (lead as any)?.company_name || '',
    [lead]
  );
  const initialContact = useMemo(
    () => (lead as any)?.name || (lead as any)?.lead_name || '',
    [lead]
  );
  const [companyName, setCompanyName] = useState<string>(initialCompany);
  const [contactName, setContactName] = useState<string>(initialContact);
  const [errors, setErrors] = useState<{ company?: string; contact?: string }>({});

  const { createMandate } = useBuyingMandates();
  const { createValoracion } = useValoraciones();

  useEffect(() => {
    setCompanyName(initialCompany);
    setContactName(initialContact);
  }, [initialCompany, initialContact]);

  // Lógica de recomendación basada en el lead
  useEffect(() => {
    const serviceType = (lead as any)?.service_type as string | undefined;
    const message = ((lead as any)?.message as string | undefined)?.toLowerCase?.() || '';

    if (serviceType === 'mandato_venta') {
      setRecommendedType('sell');
      setSelectedType('sell');
      return;
    }
    if (serviceType === 'mandato_compra') {
      setRecommendedType('buy');
      setSelectedType('buy');
      return;
    }
    if (serviceType === 'valoracion_empresa' || message.includes('valoración') || message.includes('valoracion')) {
      setRecommendedType('valuation');
      setSelectedType('valuation');
      return;
    }

    // Heurística simple por defecto
    setRecommendedType('valuation');
    setSelectedType('valuation');
  }, [lead]);

  const sectorName = (lead as any)?.sector?.nombre || (lead as any)?.sector_name || '';
  const email = (lead as any)?.email || (lead as any)?.contact_email || '';
  const phone = (lead as any)?.phone || (lead as any)?.contact_phone || '';
  const assigned_to_id = (lead as any)?.assigned_to_id || (lead as any)?.owner_id || undefined;

  // Track apertura del diálogo
  useEffect(() => {
    if (open) {
      openAtRef.current = Date.now();
      decisionMadeRef.current = false;
      selectionTrackedRef.current = false;
      recommendedTrackedRef.current = false;
      analyticsService.track('lead_closure_dialog_opened', {
        lead_id: lead.id,
        ae_id: assigned_to_id
      });
    }
  }, [open, lead?.id]);

  // Recomendada
  useEffect(() => {
    if (open && recommendedType && !recommendedTrackedRef.current) {
      analyticsService.track('option_recommended', {
        lead_id: lead.id,
        type: recommendedType,
        ae_id: assigned_to_id
      });
      recommendedTrackedRef.current = true;
    }
  }, [open, recommendedType, lead?.id]);

  const handleOpenChangeInternal = (val: boolean) => {
    if (!val) {
      if (!decisionMadeRef.current) {
        analyticsService.track('dialog_dismissed', {
          lead_id: lead.id,
          ae_id: assigned_to_id,
          time_to_decision_ms: openAtRef.current ? Date.now() - openAtRef.current : undefined
        });
      }
    }
    onOpenChange(val);
  };

  const handleSelect = (value: LeadClosureType) => {
    setSelectedType(value);
    if (!selectionTrackedRef.current) {
      analyticsService.track('option_selected', {
        lead_id: lead.id,
        type: value,
        ae_id: assigned_to_id,
        time_to_decision_ms: openAtRef.current ? Date.now() - openAtRef.current : undefined
      });
      selectionTrackedRef.current = true;
    }
  };

  // Abrir entidad ya vinculada
  const handleOpenLinked = () => {
    if (!existingLinked) return;
    analyticsService.track('entity_opened', {
      entity_id: existingLinked.id,
      type: existingLinked.type,
      lead_id: lead.id,
      ae_id: assigned_to_id
    });
    const path = existingLinked.type === 'valuation'
      ? `/valoraciones/${existingLinked.id}`
      : `/mandates/${existingLinked.id}`;
    navigate(path);
    onOpenChange(false);
  };

  // Cierre directo si motivo es spam/duplicado
  useEffect(() => {
    if (!open) return;
    const reason = (((lead as any)?.lost_reason) || '').toLowerCase();
    const isSpamDup = reason.includes('spam') || reason.includes('duplic');
    if (isSpamDup) {
      onOpenChange(false);
    }
  }, [open, lead]);

  // Detectar entidad previamente vinculada
  useEffect(() => {
    if (!open) return;
    const mandateId = (lead as any)?.converted_to_mandate_id;
    const valuationId = (lead as any)?.converted_to_valoracion_id;
    if (mandateId) {
      const st = (lead as any)?.service_type;
      let t: LeadClosureType = 'buy';
      if (st === 'mandato_venta') t = 'sell';
      else if (st === 'mandato_compra') t = 'buy';
      setExistingLinked({ id: mandateId, type: t });
    } else if (valuationId) {
      setExistingLinked({ id: valuationId, type: 'valuation' });
    } else {
      setExistingLinked(null);
    }
  }, [open, lead]);

  const validate = () => {
    const next: { company?: string; contact?: string } = {};
    if (selectedType === 'valuation') {
      if (!companyName?.trim()) next.company = 'Empresa requerida';
      if (!contactName?.trim()) next.contact = 'Contacto requerido';
    } else {
      // Para mandatos pedimos al menos contacto
      if (!contactName?.trim()) next.contact = 'Contacto requerido';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCloseOnly = () => {
    decisionMadeRef.current = true;
    if (!selectionTrackedRef.current) {
      analyticsService.track('option_selected', {
        lead_id: lead.id,
        type: selectedType,
        ae_id: assigned_to_id,
        time_to_decision_ms: openAtRef.current ? Date.now() - openAtRef.current : undefined
      });
      selectionTrackedRef.current = true;
    }
    onOpenChange(false);
  };

  const createPayloadMandate = (type: LeadClosureType): CreateBuyingMandateData => {
    const isSell = type === 'sell';
    const mandateNameBase = isSell ? 'Mandato de Venta' : 'Mandato de Compra';
    return {
      client_name: contactName || (lead as any)?.name || (lead as any)?.lead_name || 'Contacto',
      client_contact: contactName || (lead as any)?.name || 'Contacto',
      client_email: email || undefined,
      client_phone: phone || undefined,
      mandate_name: `${mandateNameBase} — ${companyName || contactName || 'Sin nombre'}`,
      target_sectors: sectorName ? [sectorName] : [],
      mandate_type: isSell ? 'venta' : 'compra',
      assigned_user_id: assigned_to_id,
      start_date: new Date().toISOString(),
    };
  };

  const handleCreate = async (closeAfter: boolean) => {
    if (!validate()) return;
    try {
      decisionMadeRef.current = true;
      if (!selectionTrackedRef.current) {
        analyticsService.track('option_selected', {
          lead_id: lead.id,
          type: selectedType,
          ae_id: assigned_to_id,
          time_to_decision_ms: openAtRef.current ? Date.now() - openAtRef.current : undefined
        });
        selectionTrackedRef.current = true;
      }

      setLoading(true);
      let createdId: string | undefined;

      if (selectedType === 'valuation') {
        // Crear valoración
        await new Promise<void>((resolve, reject) => {
          try {
            createValoracion({
              company_name: companyName.trim(),
              client_name: contactName.trim(),
              client_email: email || undefined,
              status: 'requested',
            } as any);
            // No tenemos promesa desde mutate, usamos un pequeño timeout para esperar invalidación
            setTimeout(resolve, 300);
          } catch (e) {
            reject(e);
          }
        });
        toast.success('Valoración creada');
        createdId = undefined;
        onCreated?.({ type: 'valuation', id: 'new', linkToLead });
      } else {
        // Crear mandato (compra/venta)
        const payload = createPayloadMandate(selectedType);
        const { data, error } = await createMandate(payload);
        if (error || !data) throw error || new Error('No se pudo crear el mandato');
        toast.success('Mandato creado');
        createdId = data.id;
        onCreated?.({ type: selectedType, id: data.id, linkToLead });
      }

      // Track creación de entidad
      analyticsService.track('entity_created', {
        lead_id: lead.id,
        type: selectedType,
        entity_id: createdId || 'unknown',
        ae_id: assigned_to_id,
        link_to_lead: linkToLead
      });

      if (closeAfter) {
        analyticsService.track('entity_opened', {
          entity_id: createdId || 'unknown',
          type: selectedType,
          lead_id: lead.id,
          ae_id: assigned_to_id
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error al crear desde lead:', error);
      toast.error(error?.message || 'Error al crear el elemento');
    } finally {
      setLoading(false);
    }
  };

  const optionCard = (
    value: LeadClosureType,
    {
      title,
      description,
      icon,
    }: { title: string; description: string; icon: React.ReactNode }
  ) => {
    const isRecommended = recommendedType === value;
    const isSelected = selectedType === value;

    return (
      <label className="cursor-pointer" aria-label={title}>
        <Card
          className={
            'relative transition-colors border bg-card hover:border-primary/50 ' +
            (isSelected ? 'border-primary ring-1 ring-primary' : 'border-border')
          }
          onClick={() => handleSelect(value)}
        >
          <CardContent className="p-4 flex items-start gap-3">
            <RadioGroupItem value={value} id={`opt-${value}`} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">{icon}</div>
                <div className="font-medium leading-none">{title}</div>
                {isRecommended && (
                  <Badge variant="secondary" className="ml-2">Recomendado</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>
      </label>
    );
  };

  const needsCompany = !companyName?.trim();
  const needsContact = !contactName?.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="sm:max-w-xl" role="dialog" aria-modal="true" aria-labelledby="lead-closure-title">
        <DialogHeader>
          <DialogTitle id="lead-closure-title">¿Qué deseas crear a partir de este lead?</DialogTitle>
        </DialogHeader>

        {/* Resumen del lead */}
        <div className="rounded-md border bg-card p-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{companyName || 'Empresa no indicada'}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{contactName || 'Contacto no indicado'}</span>
            {email && <span className="text-muted-foreground">· {email}</span>}
            {sectorName && <span className="ml-auto text-muted-foreground">{sectorName}</span>}
          </div>
        </div>

        {existingLinked && !ignoreExisting && (
          <div className="mt-3 rounded-md border border-border bg-muted p-3 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-medium">Este lead ya tiene una entidad vinculada.</span>{' '}
                <span className="text-muted-foreground">Puedes abrirla o crear otra adicional.</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleOpenLinked}>
                  Abrir entidad vinculada
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  if (confirm('¿Crear otra entidad desde este lead?')) {
                    setIgnoreExisting(true);
                  }
                }}>
                  Crear otra
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Radios como Cards */}
        <RadioGroup value={selectedType} onValueChange={(v) => handleSelect(v as LeadClosureType)}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {optionCard('sell', {
              title: 'Mandato de Venta',
              description: 'Estructurar venta y proceso competitivo',
              icon: <TrendingUp className="h-4 w-4" />,
            })}
            {optionCard('buy', {
              title: 'Mandato de Compra',
              description: 'Búsqueda y aproximación a targets',
              icon: <Target className="h-4 w-4" />,
            })}
            {optionCard('valuation', {
              title: 'Valoración',
              description: 'Informe de valoración independiente',
              icon: <FileText className="h-4 w-4" />,
            })}
          </div>
        </RadioGroup>

        {/* Validaciones inline (solo si faltan) */}
        {(needsCompany || needsContact) && (
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {needsCompany && (
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Empresa</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nombre de la empresa"
                />
                {errors.company && (
                  <p className="text-sm text-destructive">{errors.company}</p>
                )}
              </div>
            )}
            {needsContact && (
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Contacto</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nombre del contacto"
                />
                {errors.contact && (
                  <p className="text-sm text-destructive">{errors.contact}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vincular al lead */}
        <div className="mt-2 flex items-center gap-2">
          <Checkbox id="linkToLead" checked={linkToLead} onCheckedChange={(v) => setLinkToLead(Boolean(v))} />
          <Label htmlFor="linkToLead" className="text-sm">Vincular al lead</Label>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" type="button" onClick={handleCloseOnly} disabled={loading}>
            Solo cerrar lead
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              disabled={loading}
              onClick={() => handleCreate(false)}
            >
              Crear y permanecer
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => handleCreate(true)}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear y abrir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadClosureActionDialog;
