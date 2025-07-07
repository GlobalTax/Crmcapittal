
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEmailTracking } from "@/hooks/useEmailTracking";
import { useOpenAIAssistant } from "@/hooks/useOpenAIAssistant";
import { useToast } from "@/hooks/use-toast";
import { CreateTrackedEmailData } from "@/types/EmailTracking";
import { Send, X, Bot, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail?: string;
  recipientName?: string;
  lead_id?: string;
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
}

const emailTemplates = [
  {
    id: 'intro',
    name: 'Introducción',
    subject: 'Presentación de servicios',
    content: 'Estimado/a [NOMBRE],\n\nEspero que se encuentre bien. Me pongo en contacto con usted para presentarle nuestros servicios.\n\nNuestro equipo cuenta con amplia experiencia en el sector y estaríamos encantados de poder colaborar con su empresa.\n\n¿Podríamos programar una llamada para discutir cómo podemos ayudarle?\n\nSaludos cordiales,'
  },
  {
    id: 'followup',
    name: 'Seguimiento',
    subject: 'Seguimiento de nuestra conversación',
    content: 'Estimado/a [NOMBRE],\n\nQuería hacer seguimiento a nuestra conversación anterior sobre los servicios que podemos ofrecer a su empresa.\n\n¿Ha tenido oportunidad de revisar la información que le compartí? Me gustaría conocer sus comentarios y resolver cualquier duda que pueda tener.\n\nQuedo a la espera de su respuesta.\n\nSaludos,'
  },
  {
    id: 'proposal',
    name: 'Propuesta',
    subject: 'Propuesta comercial',
    content: 'Estimado/a [NOMBRE],\n\nTengo el placer de enviarle nuestra propuesta comercial para los servicios que discutimos.\n\nHemos preparado una solución personalizada que se adapta a las necesidades específicas de su empresa, con condiciones competitivas y un excelente nivel de servicio.\n\nQuedo a su disposición para cualquier consulta o aclaración que necesite.\n\nSaludos,'
  }
];

export const EmailComposer = ({
  isOpen,
  onClose,
  recipientEmail = "",
  recipientName = "",
  lead_id,
  contact_id,
  target_company_id,
  operation_id
}: EmailComposerProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [formData, setFormData] = useState({
    recipient_email: recipientEmail,
    subject: "",
    content: "",
    sender_name: "Equipo CRM",
    sender_email: "contacto@empresa.com"
  });

  const { sendTrackedEmail, isSending } = useEmailTracking();
  const { generateEmailWithAI, isLoading: isAILoading } = useOpenAIAssistant();
  const { toast } = useToast();

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

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      setFormError('Describe qué tipo de email quieres generar');
      return;
    }

    try {
      const context = {
        recipientName: recipientName || formData.recipient_email,
        recipientEmail: formData.recipient_email,
        lead_id,
        contact_id,
        target_company_id,
        operation_id,
        currentSubject: formData.subject,
        currentContent: formData.content,
        prompt: aiPrompt
      };

      const result = await generateEmailWithAI(aiPrompt, recipientName || 'Cliente', context);
      
      if (result.success && result.result) {
        // Extraer asunto y contenido del resultado
        const lines = result.result.split('\n');
        const subjectLine = lines.find(line => line.toLowerCase().includes('asunto:'));
        let subject = formData.subject;
        let content = result.result;

        if (subjectLine) {
          subject = subjectLine.replace(/asunto:\s*/i, '').trim();
          content = result.result.replace(subjectLine, '').trim();
        }

        setFormData(prev => ({
          ...prev,
          subject: subject || prev.subject,
          content: content
        }));

        toast({
          title: "🤖 Email generado con IA",
          description: "El contenido ha sido generado automáticamente"
        });
      }
    } catch (error) {
      setFormError('Error generando email con IA');
    }
  };

  const validateForm = () => {
    if (!formData.recipient_email.trim()) {
      setFormError('El email del destinatario es requerido');
      return false;
    }
    if (!formData.content.trim()) {
      setFormError('El contenido del email es requerido');
      return false;
    }
    if (!formData.sender_email.trim()) {
      setFormError('Tu email es requerido');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const emailData: CreateTrackedEmailData & { sender_name: string; sender_email: string } = {
      recipient_email: formData.recipient_email,
      subject: formData.subject || "Sin asunto",
      content: formData.content,
      lead_id,
      contact_id,
      target_company_id,
      operation_id,
      sender_name: formData.sender_name,
      sender_email: formData.sender_email
    };

    try {
      await sendTrackedEmail(emailData);
      
      // Reset form and close dialog
      setFormData({
        recipient_email: "",
        subject: "",
        content: "",
        sender_name: "Equipo CRM",
        sender_email: "contacto@empresa.com"
      });
      setSelectedTemplate('');
      setFormError('');
      onClose();
    } catch (error) {
      setFormError('Error al enviar el email. Por favor, inténtalo de nuevo.');
    }
  };

  const handleClose = () => {
    setFormError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            Redactar Email{recipientName ? ` para ${recipientName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Redacta y envía un email con seguimiento automático
          </DialogDescription>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4 overflow-hidden">
          {/* AI vs Template Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={useAI ? "default" : "outline"}
              onClick={() => setUseAI(true)}
              size="sm"
            >
              <Bot className="h-4 w-4 mr-2" />
              Generar con IA
            </Button>
            <Button
              type="button"
              variant={!useAI ? "default" : "outline"}
              onClick={() => setUseAI(false)}
              size="sm"
            >
              Usar Plantilla
            </Button>
          </div>

          {useAI ? (
            /* AI Email Generation */
            <div className="space-y-3">
              <Label htmlFor="ai-prompt">Describe el email que quieres generar</Label>
              <div className="flex gap-2">
                <Input
                  id="ai-prompt"
                  placeholder="Ej: Email de seguimiento profesional para cerrar una operación M&A"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isAILoading || !aiPrompt.trim()}
                  size="sm"
                >
                  {isAILoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Template Selector */
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipient_email">Para *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sender_name">Tu nombre</Label>
              <Input
                id="sender_name"
                value={formData.sender_name}
                onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <Label htmlFor="sender_email">Tu email *</Label>
              <Input
                id="sender_email"
                type="email"
                value={formData.sender_email}
                onChange={(e) => setFormData(prev => ({ ...prev, sender_email: e.target.value }))}
                placeholder="tu@empresa.com"
                required
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Label htmlFor="content">Mensaje *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 resize-none min-h-[200px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSending}>
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
