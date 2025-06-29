
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEmailTracking } from "@/hooks/useEmailTracking";
import { CreateTrackedEmailData } from "@/types/EmailTracking";
import { Mail, Send } from "lucide-react";

interface EmailComposerProps {
  recipientEmail?: string;
  recipientName?: string;
  lead_id?: string;
  contact_id?: string;
  target_company_id?: string;
  operation_id?: string;
  trigger?: React.ReactNode;
}

export const EmailComposer = ({
  recipientEmail = "",
  recipientName = "",
  lead_id,
  contact_id,
  target_company_id,
  operation_id,
  trigger
}: EmailComposerProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient_email: recipientEmail,
    subject: "",
    content: ""
  });

  const { sendTrackedEmail, isSending } = useEmailTracking();

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
    setOpen(false);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Email{recipientName ? ` a ${recipientName}` : ""}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <Label htmlFor="content">Mensaje</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Escribe tu mensaje aquí..."
              rows={8}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
