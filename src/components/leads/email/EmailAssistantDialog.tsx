import { Lead } from '@/types/Lead';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLeadInteractions } from '@/hooks/useLeadInteractions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmailAssistantDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PURPOSES = [
  { value: 'intro', label: 'Email de introducción' },
  { value: 'nda', label: 'Enviar NDA' },
  { value: 'teaser', label: 'Enviar Teaser (sell-side)' },
  { value: 'brief', label: 'Enviar Brief (buy-side)' },
  { value: 'followup', label: 'Seguimiento' },
];

export const EmailAssistantDialog = ({ lead, open, onOpenChange }: EmailAssistantDialogProps) => {
  const [purpose, setPurpose] = useState<string>('intro');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { createInteraction, isCreating } = useLeadInteractions(lead.id);

  const companyName = lead.company || lead.company_name || '';
  const contactName = lead.name || '';

  const subjectSuggestions = useMemo(() => {
    const base = companyName ? `${companyName}` : 'tu empresa';
    switch (purpose) {
      case 'nda':
        return [
          `NDA para explorar oportunidad M&A con ${base}`,
          `Acuerdo de Confidencialidad – Próximos pasos`,
          `Confidencialidad para análisis de la operación`,
        ];
      case 'teaser':
        return [
          `Teaser de oportunidad – ${base}`,
          `Información inicial de la operación (Teaser)`,
          `Material preliminar – Proyecto confidencial`,
        ];
      case 'brief':
        return [
          `Brief de búsqueda – Criterios y alcance`,
          `Mandato buy-side – Foco y rangos EV`,
          `Criterios de inversión – Próximos pasos`,
        ];
      case 'followup':
        return [
          `Seguimiento sobre nuestra conversación`,
          `¿Seguimos con los siguientes pasos?`,
          `Recordatorio amable – Propuesta/NDA`,
        ];
      default:
        return [
          `Explorar potencial colaboración M&A`,
          `Introducción – ${base} x CRM Pro`,
          `Oportunidades M&A en ${base}`,
        ];
    }
  }, [purpose, companyName]);

  useEffect(() => {
    // Autoseleccionar el primer asunto sugerido
    setSubject(subjectSuggestions[0] || '');

    // Generar cuerpo base
    const lines: string[] = [];
    const firstName = contactName?.split(' ')[0] || '';

    lines.push(firstName ? `Hola ${firstName},` : 'Hola,');

    if (purpose === 'intro') {
      lines.push('Soy parte del equipo de M&A en CRM Pro. Ayudamos a directivos y accionistas a preparar y ejecutar procesos de compraventa de compañías (1M€–100M€ EV).');
      lines.push('¿Te parece si agendamos 15 minutos para evaluar encaje y próximos pasos?');
    }

    if (purpose === 'nda') {
      lines.push('Adjunto nuestro NDA estándar para poder compartir información confidencial y avanzar en el análisis.');
      lines.push('En cuanto esté firmado, te enviamos el material inicial.');
    }

    if (purpose === 'teaser') {
      lines.push('Como acordado, compartimos el Teaser con la información clave de la oportunidad.');
      lines.push('Si ves interés, coordinamos una llamada para resolver dudas y avanzar.');
    }

    if (purpose === 'brief') {
      lines.push('Adjunto Brief con criterios de búsqueda (sector/NAICS, geografía, rango EV) para tu validación.');
      lines.push('Con tu OK, activamos el deal-sourcing y pipeline inicial.');
    }

    if (purpose === 'followup') {
      lines.push('Solo un breve recordatorio sobre los próximos pasos que comentamos.');
      lines.push('¿Podemos cerrar fecha para una llamada esta semana?');
    }

    lines.push('');
    lines.push('Quedo atento. Gracias y saludos,');
    lines.push('');
    lines.push('— Equipo CRM Pro');

    setBody(lines.join('\n'));
  }, [purpose, contactName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Asunto: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success('Email copiado al portapapeles');
    } catch (e) {
      toast.error('No se pudo copiar');
    }
  };

  const handleSaveInteraction = () => {
    createInteraction({
      lead_id: lead.id,
      tipo: 'email',
      detalle: `Asunto: ${subject}\n\n${body}`,
    });
    onOpenChange(false);
  };

  const handleSend = async () => {
    if (!lead.email) {
      toast.error('Este lead no tiene email');
      return;
    }
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-tracked-email', {
        body: {
          recipient_email: lead.email,
          subject,
          content: body,
          lead_id: lead.id,
        },
      });
      if (error) throw error;
      toast.success('Email enviado');
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo enviar el email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asistente de Email</DialogTitle>
          <DialogDescription>
            Genera y guarda emails contextuales para este lead.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-1 space-y-2">
              <Label>Propósito</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona propósito" />
                </SelectTrigger>
                <SelectContent>
                  {PURPOSES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Asunto</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} />
              <div className="flex flex-wrap gap-2 pt-1">
                {subjectSuggestions.map((s) => (
                  <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setSubject(s)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contenido</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={12} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Lead: <span className="font-medium">{lead.name || companyName || lead.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            <Button variant="secondary" onClick={handleSaveInteraction} disabled={isCreating}>
              Guardar como interacción
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? 'Enviando…' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
