
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lead } from '@/types/Lead';
import { logLeadClosureDialogOpened } from '@/hooks/leads/useLeadClosure';
import { logger } from '@/utils/productionLogger';

type LeadClosureType = 'mandato_venta' | 'valoracion';

interface LeadClosureActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onCreateFromLead: (
    leadId: string,
    type: LeadClosureType,
    payload: any,
    linkToLead: boolean
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
}

export const LeadClosureActionDialog: React.FC<LeadClosureActionDialogProps> = ({
  isOpen,
  onClose,
  lead,
  onCreateFromLead
}) => {
  // 1) Hooks SIEMPRE al tope (no condicionales)
  const initialType: LeadClosureType = useMemo(() => {
    // si el lead ya trae un service_type compatible, úsalo como sugerencia
    if (lead?.service_type === 'mandato_venta') return 'mandato_venta';
    if (lead?.service_type === 'valoracion_empresa') return 'valoracion';
    return 'mandato_venta';
  }, [lead?.service_type]);

  const [selectedType, setSelectedType] = useState<LeadClosureType>(initialType);

  const [companyName, setCompanyName] = useState<string>(lead?.company || '');
  const [contactName, setContactName] = useState<string>(lead?.name || '');
  const [contactEmail, setContactEmail] = useState<string>(lead?.email || '');

  // Campos específicos por tipo (mantenerlos siempre declarados)
  // Mandato
  const [sector, setSector] = useState<string>('');
  const [ebitdaRange, setEbitdaRange] = useState<string>('');
  // Valoración
  const [purpose, setPurpose] = useState<string>('');
  const [revenueRange, setRevenueRange] = useState<string>('');

  const [linkToLead, setLinkToLead] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Efecto para registrar apertura (incondicional, con guardas internas)
  useEffect(() => {
    if (isOpen && lead?.id) {
      // No altera el orden de hooks; el if es dentro del efecto
      logLeadClosureDialogOpened(lead.id);
    }
  }, [isOpen, lead?.id]);

  // Validación mínima requerida por tests
  const isValid = useMemo(() => {
    return Boolean(
      companyName?.trim() &&
      contactName?.trim() &&
      contactEmail?.trim()
    );
  }, [companyName, contactName, contactEmail]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || !lead?.id) return;

    setSubmitting(true);
    const payload: any = {
      company_name: companyName.trim(),
      contact_name: contactName.trim(),
      contact_email: contactEmail.trim(),
    };

    if (selectedType === 'mandato_venta') {
      payload.sector = sector;
      payload.ebitda_range = ebitdaRange;
    } else {
      payload.purpose = purpose;
      payload.revenue_range = revenueRange;
    }

    try {
      const res = await onCreateFromLead(lead.id, selectedType, payload, linkToLead);
      if (res?.success) {
        // Mantener comportamiento esperado por los tests: cerrar el diálogo en éxito
        onClose?.();
      }
    } catch (err) {
      // En error, mantener el diálogo abierto (los tests lo esperan)
      // La notificación la maneja el mock de useToast en tests de la app principal
      logger.error('Failed to create element from lead', { error: err, leadId: lead.id, type: selectedType });
    } finally {
      setSubmitting(false);
    }
  }, [
    isValid,
    lead?.id,
    companyName,
    contactName,
    contactEmail,
    selectedType,
    linkToLead,
    sector,
    ebitdaRange,
    purpose,
    revenueRange,
    onCreateFromLead,
    onClose
  ]);

  // Etiquetas y textos dinámicos
  const isMandate = selectedType === 'mandato_venta';
  const submitLabel = isMandate ? 'Crear Mandato de Venta' : 'Crear Valoración';

  const recommendedFor = useMemo<LeadClosureType>(() => {
    if (lead?.service_type === 'valoracion_empresa') return 'valoracion';
    return 'mandato_venta';
  }, [lead?.service_type]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose?.() : void 0)}>
      <DialogContent className="max-w-xl" data-testid="lead-closure-dialog">
        <DialogHeader>
          <DialogTitle>Crear desde Lead: {lead?.name || '—'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Selección de tipo con “Recomendado” */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Selecciona qué deseas crear desde este lead
            </p>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-2 p-3 border rounded-md hover:bg-muted/30 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  aria-label="Mandato de Venta"
                  checked={selectedType === 'mandato_venta'}
                  onChange={() => setSelectedType('mandato_venta')}
                />
                <span className="font-medium">Mandato de Venta</span>
                {recommendedFor === 'mandato_venta' && (
                  <span className="ml-auto text-xs rounded bg-primary/10 text-primary px-2 py-1">
                    Recomendado
                  </span>
                )}
              </label>

              <label className="flex items-center gap-2 p-3 border rounded-md hover:bg-muted/30 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  aria-label="Valoración"
                  checked={selectedType === 'valoracion'}
                  onChange={() => setSelectedType('valoracion')}
                />
                <span className="font-medium">Valoración</span>
                {recommendedFor === 'valoracion' && (
                  <span className="ml-auto text-xs rounded bg-primary/10 text-primary px-2 py-1">
                    Recomendado
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Datos básicos requeridos */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact">Contacto *</Label>
              <Input
                id="contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@empresa.com"
              />
            </div>
          </div>

          {/* Campos específicos por tipo (JSX condicional SIN hooks internos) */}
          {isMandate ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  aria-label="Sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="Selecciona o escribe un sector"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ebitda">Rango EBITDA</Label>
                <Input
                  id="ebitda"
                  aria-label="Rango EBITDA"
                  value={ebitdaRange}
                  onChange={(e) => setEbitdaRange(e.target.value)}
                  placeholder="p.ej. 1M€ - 5M€"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="purpose">Propósito</Label>
                <Input
                  id="purpose"
                  aria-label="Propósito"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Motivo de la valoración"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revenue">Rango Facturación</Label>
                <Input
                  id="revenue"
                  aria-label="Rango Facturación"
                  value={revenueRange}
                  onChange={(e) => setRevenueRange(e.target.value)}
                  placeholder="p.ej. 5M€ - 20M€"
                />
              </div>
            </div>
          )}

          {/* Preferencia de enlace/navegación */}
          <label className="flex items-center gap-2 p-2 rounded-md cursor-pointer select-none">
            <input
              type="checkbox"
              checked={linkToLead}
              onChange={(e) => setLinkToLead(e.target.checked)}
            />
            <span>Vincular al lead y navegar al nuevo elemento</span>
          </label>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || submitting}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadClosureActionDialog;
