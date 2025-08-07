import { Lead } from '@/types/Lead';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLeadInteractions } from '@/hooks/useLeadInteractions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { emailAssistant, EmailTone } from '@/services/emailAssistant';
import { Checkbox } from '@/components/ui/checkbox';
import { useLeadTasks } from '@/hooks/useLeadTasksSimple';

interface EmailAssistantDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailAssistantDialog = ({ lead, open, onOpenChange }: EmailAssistantDialogProps) => {
  const [purpose, setPurpose] = useState<string>('intro');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [tone, setTone] = useState<EmailTone>('profesional');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [scheduleFollowUps, setScheduleFollowUps] = useState(true);

  const { createInteraction, isCreating } = useLeadInteractions(lead.id);
  const { createTask } = useLeadTasks(lead.id);

  const ctx = useMemo(() => ({
    name: lead.name,
    company: lead.company || lead.company_name,
    service_type: lead.service_type,
    deal_value: lead.deal_value,
  }), [lead]);

  const templates = useMemo(() => emailAssistant.getTemplates(ctx), [ctx]);
  const bestTime = useMemo(() => emailAssistant.predictBestSendTime(ctx), [ctx]);

  useEffect(() => {
    const t = templates[0];
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  }, [templates]);

  const insertToken = (token: string) => {
    setBody((prev) => (prev || '') + (prev?.endsWith(' ') ? '' : ' ') + token + ' ');
  };

  const handleImprove = () => {
    const improved = emailAssistant.improveContent(body, tone);
    setBody(improved);
    const { A, B } = emailAssistant.optimizeSubject(subject);
    // Elegimos A por defecto pero mostramos B como opción rápida
    setSubject(A);
    toast.success('Contenido optimizado');
  };

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

      // Programar follow-ups básicos
      if (scheduleFollowUps) {
        const now = new Date();
        const d3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const d7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        createTask({ lead_id: lead.id, title: 'Follow-up email (3 días)', due_date: d3, priority: 'medium' });
        createTask({ lead_id: lead.id, title: 'Follow-up email (7 días)', due_date: d7, priority: 'medium' });
      }

      toast.success('Email enviado');
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo enviar el email');
    } finally {
      setIsSending(false);
    }
  };

  const { A, B } = useMemo(() => emailAssistant.optimizeSubject(subject), [subject]);
  const sanitizedPreview = useMemo(() => DOMPurify.sanitize(body.includes('<') ? body : body.split('\n').map(p => `<p>${p}</p>`).join('')), [body]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Redactar Email Inteligente</DialogTitle>
          <DialogDescription>
            Templates sugeridos por IA, editor enriquecido, preview y envío con tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={purpose} onValueChange={(v) => {
                setPurpose(v);
                const t = templates.find(t => t.id === v);
                if (t) { setSubject(t.subject); setBody(t.body); }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tono</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tono" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profesional">Profesional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mejor hora de envío</Label>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{bestTime.day} {bestTime.time}</Badge>
                <span className="text-muted-foreground">conf. {(bestTime.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asunto</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
            <div className="flex flex-wrap gap-2 pt-1 items-center">
              <span className="text-xs text-muted-foreground">A/B testing:</span>
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSubject(A)}>
                A: {A}
              </Badge>
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSubject(B)}>
                B: {B}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contenido</Label>
              <ReactQuill theme="snow" value={body} onChange={setBody} />
              <div className="flex flex-wrap gap-2 pt-2">
                {emailAssistant.tokens.map(t => (
                  <Badge key={t.key} variant="outline" className="cursor-pointer" onClick={() => insertToken(t.key)}>
                    {t.key}
                  </Badge>
                ))}
                <Button variant="secondary" size="sm" onClick={handleImprove}>
                  <Sparkles className="h-4 w-4 mr-2" /> Mejorar con IA
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-md p-3 h-[300px] overflow-auto bg-background">
                <div dangerouslySetInnerHTML={{ __html: sanitizedPreview }} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="followups" checked={scheduleFollowUps} onCheckedChange={(v) => setScheduleFollowUps(Boolean(v))} />
            <Label htmlFor="followups" className="text-sm text-muted-foreground">Programar secuencia de follow-up (3 y 7 días)</Label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Lead: <span className="font-medium">{lead.name || lead.company || lead.id}</span>
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
