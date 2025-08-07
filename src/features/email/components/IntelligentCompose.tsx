import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Eye, 
  Clock,
  Building,
  Target,
  User,
  X,
  Sparkles
} from 'lucide-react';
import { Email, EmailComposeData } from '../types';
import { useEmailTemplates } from '../hooks/useEmailTemplates';
import { useSendEmail } from '../hooks/useEmails';

interface IntelligentComposeProps {
  toEmail?: string;
  subject?: string;
  originalEmail?: Email;
  onCancel: () => void;
  onSent: () => void;
}

export const IntelligentCompose: React.FC<IntelligentComposeProps> = ({
  toEmail = '',
  subject = '',
  originalEmail,
  onCancel,
  onSent
}) => {
  const [formData, setFormData] = useState<EmailComposeData>({
    to: toEmail ? [toEmail] : [],
    cc: [],
    bcc: [],
    subject: subject,
    body_html: '',
    body_text: '',
    tracking_enabled: true
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string>('');
  const [currentToEmail, setCurrentToEmail] = useState('');

  const { data: templates = [] } = useEmailTemplates();
  const sendEmailMutation = useSendEmail();

  // Smart merge fields
  const mergeFields = [
    { key: '{{contact.name}}', label: 'Nombre del contacto', example: 'Juan Pérez' },
    { key: '{{company.name}}', label: 'Nombre de la empresa', example: 'ABC Corp' },
    { key: '{{deal.value}}', label: 'Valor del deal', example: '€450,000' },
    { key: '{{deal.stage}}', label: 'Etapa del deal', example: 'Negociación' },
    { key: '{{user.name}}', label: 'Tu nombre', example: 'María García' },
    { key: '{{user.signature}}', label: 'Tu firma', example: 'Saludos cordiales...' },
  ];

  // Auto-populate CRM context from original email
  useEffect(() => {
    if (originalEmail) {
      const signature = `\n\n---\n\nOriginal message from ${originalEmail.sender_name || originalEmail.sender_email}:\n${originalEmail.body_text?.slice(0, 200)}...`;
      setFormData(prev => ({
        ...prev,
        body_text: signature,
        contact_id: originalEmail.contact_id,
        lead_id: originalEmail.lead_id,
        deal_id: originalEmail.deal_id,
        company_id: originalEmail.company_id
      }));
    }
  }, [originalEmail]);

  const handleAddEmail = (email: string) => {
    if (email && email.includes('@')) {
      setFormData(prev => ({
        ...prev,
        to: [...prev.to, email]
      }));
      setCurrentToEmail('');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      to: prev.to.filter((_, i) => i !== index)
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Process merge fields
      let processedSubject = template.subject;
      let processedBody = template.body_html || template.body_text || '';

      // Apply basic merge field processing
      if (originalEmail?.deal_id) {
        processedSubject = processedSubject.replace('{{deal.value}}', '€450,000');
        processedBody = processedBody.replace('{{deal.value}}', '€450,000');
      }

      setFormData(prev => ({
        ...prev,
        subject: processedSubject,
        body_html: processedBody,
        body_text: processedBody.replace(/<[^>]*>/g, ''),
        template_id: template.id
      }));
    }
    setSelectedTemplate(templateId);
  };

  const insertMergeField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      body_text: prev.body_text + field
    }));
  };

  const handleSend = async () => {
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
        accountId: 'default' // This would come from context
      });
      onSent();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const getCrmContext = () => {
    if (originalEmail?.deal_id) {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          <Building className="h-3 w-3 mr-1" />
          Deal Context
        </Badge>
      );
    }
    if (originalEmail?.lead_id) {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <Target className="h-3 w-3 mr-1" />
          Lead Context
        </Badge>
      );
    }
    if (originalEmail?.contact_id) {
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
          <User className="h-3 w-3 mr-1" />
          Contact Context
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* CRM Context */}
      {getCrmContext() && (
        <div className="mb-4">
          {getCrmContext()}
        </div>
      )}

      {/* Template Selection */}
      {templates.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Label className="text-sm font-medium">Template:</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Email Fields */}
      <div className="space-y-3 mb-4">
        {/* Para */}
        <div className="flex items-start gap-2">
          <Label className="w-12 text-sm mt-2">Para:</Label>
          <div className="flex-1">
            <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md">
              {formData.to.map((email, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveEmail(index)}
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
                    handleAddEmail(currentToEmail);
                  }
                }}
                className="border-0 p-0 h-6 flex-1 min-w-[200px] focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

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

      {/* Merge Fields */}
      <div className="mb-4">
        <Label className="text-sm font-medium mb-2 block">Campos automáticos:</Label>
        <div className="flex flex-wrap gap-1">
          {mergeFields.slice(0, 4).map((field) => (
            <Button
              key={field.key}
              variant="outline"
              size="sm"
              className="text-xs h-6"
              onClick={() => insertMergeField(field.key)}
            >
              {field.key}
            </Button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="flex-1 flex flex-col">
        <Label className="text-sm font-medium mb-2">Mensaje:</Label>
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

      {/* Options */}
      <div className="flex items-center gap-4 mt-4 text-sm">
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
          Tracking
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            className="rounded"
          />
          <Clock className="h-4 w-4" />
          Programar
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <Button variant="ghost" size="sm">
          <Paperclip className="h-4 w-4 mr-2" />
          Adjuntar
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSend}
            disabled={sendEmailMutation.isPending || formData.to.length === 0}
            className="flex items-center gap-2"
          >
            {sendEmailMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};