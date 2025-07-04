import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/Lead";
import { Mail, Send, Eye } from "lucide-react";
import { toast } from "sonner";

interface EmailTemplateDialogProps {
  lead: Lead | null;
}

const emailTemplates = {
  welcome: {
    name: 'Bienvenida',
    subject: 'Bienvenido/a, {{name}}! Gracias por tu interés',
    body: `Hola {{name}},

Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje y valoramos tu interés en nuestros servicios.

{{#if company_name}}
Vemos que representas a {{company_name}}, lo cual es muy interesante para nosotros.
{{/if}}

Uno de nuestros especialistas se pondrá en contacto contigo en las próximas 24 horas para entender mejor tus necesidades y ver cómo podemos ayudarte.

Mientras tanto, te invitamos a explorar nuestros recursos:
- Casos de éxito
- Guías especializadas
- Webinars gratuitos

¡Esperamos poder colaborar contigo pronto!

Saludos cordiales,
El equipo de [Tu Empresa]`
  },
  followup: {
    name: 'Seguimiento',
    subject: 'Seguimiento: ¿Podemos ayudarte con tu proyecto?',
    body: `Hola {{name}},

Hace unos días te pusiste en contacto con nosotros {{#if company_name}}desde {{company_name}}{{/if}} y queríamos hacer un seguimiento para ver si podemos ayudarte con tu proyecto.

Entendemos que las decisiones empresariales requieren tiempo y consideración. Estamos aquí para resolver cualquier duda que puedas tener y proporcionarte la información que necesites.

¿Te gustaría programar una llamada de 15 minutos para hablar sobre:
- Tus objetivos específicos
- Cómo nuestros servicios pueden ayudarte
- Opciones de colaboración

Simplemente responde a este email con tu disponibilidad y coordinaremos una llamada.

Saludos,
[Tu nombre]`
  },
  nurturing: {
    name: 'Nurturing - Contenido Valioso',
    subject: 'Recursos exclusivos para {{company_name || "tu empresa"}}',
    body: `Hola {{name}},

Sabemos que estás evaluando opciones para {{#if company_name}}{{company_name}}{{/if}} y queremos apoyarte en este proceso compartiendo algunos recursos que pueden ser de gran valor:

📊 **Caso de Éxito Reciente**
Cómo ayudamos a una empresa similar a incrementar sus resultados en un 40%

📈 **Guía Práctica**
Las 5 claves para optimizar tu estrategia empresarial

🎯 **Herramienta Gratuita**
Checklist de evaluación de procesos empresariales

Estos recursos están diseñados específicamente para empresas como la tuya y pueden proporcionarte insights valiosos independientemente de si decidimos trabajar juntos.

¿Te interesa algún tema en particular? Responde a este email y podremos personalizar la información según tus necesidades específicas.

Un saludo,
[Tu nombre]`
  },
  qualification: {
    name: 'Calificación - Próximos Pasos',
    subject: 'Próximos pasos para {{company_name || "tu proyecto"}}',
    body: `Hola {{name}},

Tras nuestra conversación inicial, me complace confirmar que podemos ayudarte a alcanzar tus objetivos {{#if company_name}}en {{company_name}}{{/if}}.

**Resumen de tu situación:**
- Objetivo: [Personalizar según el lead]
- Timeframe: [Personalizar según el lead]
- Presupuesto estimado: [Personalizar según el lead]

**Próximos pasos propuestos:**

1. **Análisis detallado** (Semana 1)
   - Evaluación completa de tu situación actual
   - Identificación de oportunidades de mejora

2. **Propuesta personalizada** (Semana 2)
   - Plan de acción específico
   - Cronograma detallado
   - Inversión requerida

3. **Reunión de presentación** (Semana 3)
   - Presentación de la propuesta
   - Resolución de dudas
   - Definición de próximos pasos

¿Te parece bien este enfoque? ¿Hay algún aspecto específico que te gustaría que priorizáramos?

Quedo a tu disposición para cualquier consulta.

Saludos cordiales,
[Tu nombre]`
  }
};

export const EmailTemplateDialog = ({ lead }: EmailTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof emailTemplates>('welcome');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleTemplateChange = (templateKey: keyof typeof emailTemplates) => {
    setSelectedTemplate(templateKey);
    const template = emailTemplates[templateKey];
    setSubject(template.subject);
    setBody(template.body);
  };

  const replaceVariables = (text: string, lead: Lead) => {
    if (!lead) return text;
    
    return text
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{email\}\}/g, lead.email)
      .replace(/\{\{phone\}\}/g, lead.phone || '')
      .replace(/\{\{company_name\}\}/g, lead.company_name || '')
      .replace(/\{\{job_title\}\}/g, lead.job_title || '')
      .replace(/\{\{#if company_name\}\}(.*?)\{\{\/if\}\}/g, lead.company_name ? '$1' : '')
      .replace(/\{\{company_name \|\| "tu empresa"\}\}/g, lead.company_name || 'tu empresa')
      .replace(/\{\{company_name \|\| "tu proyecto"\}\}/g, lead.company_name || 'tu proyecto');
  };

  const getPreviewContent = () => {
    if (!lead) return { subject: '', body: '' };
    
    return {
      subject: replaceVariables(subject, lead),
      body: replaceVariables(body, lead)
    };
  };

  const handleSendEmail = () => {
    if (!lead) {
      toast.error('No hay lead seleccionado');
      return;
    }

    const previewContent = getPreviewContent();
    
    // Simulate sending email
    toast.success('Email enviado exitosamente');
    setOpen(false);
    
    // In a real implementation, you would integrate with an email service
    console.log('Sending email to:', lead.email);
    console.log('Subject:', previewContent.subject);
    console.log('Body:', previewContent.body);
  };

  if (!lead) return null;

  const previewContent = getPreviewContent();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Email a {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{lead.email}</Badge>
              {lead.company_name && (
                <Badge variant="outline">{lead.company_name}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPreview ? 'Editar' : 'Vista Previa'}
              </Button>
            </div>
          </div>

          {!isPreview ? (
            <>
              <div>
                <Label>Template</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(emailTemplates).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Asunto</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Asunto del email"
                />
              </div>

              <div>
                <Label>Mensaje</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Contenido del email"
                  rows={12}
                />
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>Variables disponibles:</strong> {'{'}{'}{'}name{'}'}{'}'},  {'{'}{'}{'}email{'}'}{'}'},  {'{'}{'}{'}company_name{'}'}{'}'},  {'{'}{'}{'}job_title{'}'}{'}'},  {'{'}{'}{'}phone{'}'}{'}'} 
              </div>
            </>
          ) : (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Asunto:</Label>
                <p className="text-sm mt-1">{previewContent.subject}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Mensaje:</Label>
                <div className="text-sm mt-1 whitespace-pre-wrap">
                  {previewContent.body}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} className="gap-2">
              <Send className="h-4 w-4" />
              Enviar Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};