import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Paperclip, 
  Clock, 
  Eye, 
  FileText,
  Users,
  X,
  Plus
} from 'lucide-react';
import { useEmailAccounts } from '../hooks/useEmailAccounts';
import { useEmailTemplates } from '../hooks/useEmailTemplates';
import { useSendEmail } from '../hooks/useEmails';
import { EmailComposeData } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EmailComposeProps {
  isOpen: boolean;
  onClose: () => void;
  toEmail?: string;
  subject?: string;
  contactId?: string;
  leadId?: string;
  dealId?: string;
  companyId?: string;
}

export const EmailCompose: React.FC<EmailComposeProps> = ({ 
  isOpen, 
  onClose,
  toEmail = '',
  subject = '',
  contactId,
  leadId,
  dealId,
  companyId
}) => {
  const [formData, setFormData] = useState<EmailComposeData>({
    to: toEmail ? [toEmail] : [],
    cc: [],
    bcc: [],
    subject: subject,
    body_html: '',
    body_text: '',
    contact_id: contactId,
    lead_id: leadId,
    deal_id: dealId,
    company_id: companyId,
    tracking_enabled: true
  });

  const [currentToEmail, setCurrentToEmail] = useState('');
  const [currentCcEmail, setCurrentCcEmail] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);

  const { data: accounts = [] } = useEmailAccounts();
  const { data: templates = [] } = useEmailTemplates();
  const sendEmailMutation = useSendEmail();

  const defaultAccount = accounts.find(acc => acc.is_default) || accounts[0];

  const handleAddEmail = (type: 'to' | 'cc' | 'bcc', email: string) => {
    if (email && email.includes('@')) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type] || [], email]
      }));
      
      if (type === 'to') setCurrentToEmail('');
      if (type === 'cc') setCurrentCcEmail('');
    }
  };

  const handleRemoveEmail = (type: 'to' | 'cc' | 'bcc', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        body_html: template.body_html,
        body_text: template.body_text || '',
        template_id: template.id
      }));
    }
    setSelectedTemplate(templateId);
  };

  const handleSend = async () => {
    if (!defaultAccount) {
      alert('No hay cuentas de email configuradas');
      return;
    }

    if (formData.to.length === 0 || !formData.subject.trim()) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const emailData = {
      ...formData,
      scheduled_for: isScheduled ? scheduledFor : undefined
    };

    try {
      await sendEmailMutation.mutateAsync({
        emailData,
        accountId: defaultAccount.id
      });
      onClose();
      // Reset form
      setFormData({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body_html: '',
        body_text: '',
        tracking_enabled: true
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Redactar Email
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Selección de plantilla */}
          {templates.length > 0 && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Plantilla:</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Campos del email */}
          <div className="space-y-3">
            {/* De */}
            <div className="flex items-center gap-2">
              <Label className="w-12 text-sm">De:</Label>
              <div className="flex-1">
                <Badge variant="secondary" className="text-sm">
                  {defaultAccount?.email_address || 'No configurado'}
                </Badge>
              </div>
            </div>

            {/* Para */}
            <div className="flex items-start gap-2">
              <Label className="w-12 text-sm mt-2">Para:</Label>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md">
                  {formData.to.map((email, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveEmail('to', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Agregar destinatario..."
                    value={currentToEmail}
                    onChange={(e) => setCurrentToEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddEmail('to', currentToEmail);
                      }
                    }}
                    className="border-0 p-0 h-6 flex-1 min-w-[200px] focus-visible:ring-0"
                  />
                </div>
                
                {!showCcBcc && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCcBcc(true)}
                      className="text-xs h-6"
                    >
                      Cc/Cco
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* CC/BCC */}
            {showCcBcc && (
              <>
                <div className="flex items-start gap-2">
                  <Label className="w-12 text-sm mt-2">Cc:</Label>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md">
                      {formData.cc?.map((email, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRemoveEmail('cc', index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Input
                        placeholder="Cc..."
                        value={currentCcEmail}
                        onChange={(e) => setCurrentCcEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddEmail('cc', currentCcEmail);
                          }
                        }}
                        className="border-0 p-0 h-6 flex-1 min-w-[200px] focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Asunto */}
            <div className="flex items-center gap-2">
              <Label className="w-12 text-sm">Asunto:</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del email"
                className="flex-1"
              />
            </div>
          </div>

          <Separator />

          {/* Editor de contenido */}
          <div className="flex-1 flex flex-col gap-2">
            <Label className="text-sm font-medium">Mensaje:</Label>
            <Textarea
              value={formData.body_text}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                body_text: e.target.value,
                body_html: e.target.value.replace(/\n/g, '<br>')
              }))}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 min-h-[200px] resize-none"
            />
          </div>

          {/* Opciones adicionales */}
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.tracking_enabled}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tracking_enabled: e.target.checked 
                }))}
                className="rounded"
              />
              <Eye className="h-4 w-4" />
              Habilitar tracking
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded"
              />
              <Clock className="h-4 w-4" />
              Programar envío
            </label>

            {isScheduled && (
              <Input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-48"
              />
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Adjuntar
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Vincular CRM
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSend}
              disabled={sendEmailMutation.isPending || formData.to.length === 0}
              className="flex items-center gap-2"
            >
              {sendEmailMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : isScheduled ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isScheduled ? 'Programar' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};