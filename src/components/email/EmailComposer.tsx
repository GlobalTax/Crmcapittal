
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEmailTracking } from "@/hooks/useEmailTracking";
import { CreateTrackedEmailData } from "@/types/EmailTracking";
import { Mail, Send, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailComposerProps {
  recipientEmail?: string;
  recipientName?: string;
  lead_id?: string;
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const emailTemplates = [
  {
    id: 'intro',
    name: 'Introducción',
    subject: 'Presentación de servicios',
    content: 'Estimado/a [NOMBRE],\n\nEspero que se encuentre bien. Me pongo en contacto con usted para presentarle nuestros servicios...\n\nSaludos cordiales,'
  },
  {
    id: 'followup',
    name: 'Seguimiento',
    subject: 'Seguimiento de nuestra conversación',
    content: 'Estimado/a [NOMBRE],\n\nQuería hacer seguimiento a nuestra conversación anterior...\n\nQuedo a la espera de su respuesta.\n\nSaludos,'
  },
  {
    id: 'proposal',
    name: 'Propuesta',
    subject: 'Propuesta comercial',
    content: 'Estimado/a [NOMBRE],\n\nTengo el placer de enviarle nuestra propuesta comercial...\n\nQuedo a su disposición para cualquier consulta.\n\nSaludos,'
  }
];

export const EmailComposer = ({
  recipientEmail = "",
  recipientName = "",
  lead_id,
  contact_id,
  target_company_id,
  operation_id,
  trigger,
  onClose
}: EmailComposerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    recipient_email: recipientEmail,
    subject: "",
    content: ""
  });

  const { sendTrackedEmail, isSending } = useEmailTracking();

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content.replace('[NOMBRE]', recipientName || '')
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipient_email || !formData.content) {
      return;
    }

    const emailData: CreateTrackedEmailData = {
      recipient_email: formData.recipient_email,
      subject: formData.subject || "Sin asunto",
      content: formData.content,
      lead_id,
      contact_id,
      target_company_id,
      operation_id
    };

    await sendTrackedEmail(emailData);
    
    // Reset form and close dialog on success
    setFormData({
      recipient_email: recipientEmail,
      subject: "",
      content: ""
    });
    setSelectedTemplate('');
    setOpen(false);
    onClose?.();
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const defaultTrigger = (
    <Button size="sm" className="flex items-center gap-2">
      <Mail className="h-4 w-4" />
      Enviar Email
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            Redactar Email{recipientName ? ` para ${recipientName}` : ""}
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4 overflow-hidden">
          {/* Template Selector */}
          <div>
            <Label htmlFor="template">Plantilla</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plantilla (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipient_email">Para</Label>
              <Input
                id="recipient_email"
                type="email"
                value={formData.recipient_email}
                onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
                placeholder="destinatario@empresa.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del email"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Label htmlFor="content">Mensaje</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 resize-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSending} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {isSending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
