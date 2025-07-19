
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Send, AlertCircle } from 'lucide-react';
import { useSecureCampaigns } from '@/hooks/useSecureCampaigns';
import { sanitizeString } from '@/utils/validation';
import { secureLogger } from '@/utils/secureLogger';

const campaignFormSchema = z.object({
  subject: z.string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no debe exceder 200 caracteres')
    .refine(val => !val.includes('<script'), 'Contenido no permitido en el asunto'),
  html_body: z.string()
    .min(20, 'El contenido debe tener al menos 20 caracteres')
    .max(50000, 'El contenido es demasiado largo')
    .refine(val => !val.includes('<script'), 'Scripts no permitidos en el contenido'),
  audience: z.enum(['general', 'investors', 'companies'], {
    required_error: 'Selecciona una audiencia'
  }),
  opportunity_ids: z.array(z.string().uuid()).default([])
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface SecureCampaignFormProps {
  onSuccess?: () => void;
}

export const SecureCampaignForm: React.FC<SecureCampaignFormProps> = ({ onSuccess }) => {
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const { sendCampaign, isSending } = useSecureCampaigns();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      subject: '',
      html_body: '',
      audience: 'general',
      opportunity_ids: []
    }
  });

  const validateSecurityContent = (data: CampaignFormData) => {
    const warnings: string[] = [];
    
    // Verificar contenido potencialmente peligroso
    const dangerousPatterns = [
      /javascript:/gi,
      /on\w+=/gi,
      /<script/gi,
      /<iframe/gi,
      /vbscript:/gi
    ];

    const contentToCheck = `${data.subject} ${data.html_body}`;
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(contentToCheck)) {
        warnings.push('Se detectó contenido potencialmente peligroso en el mensaje');
      }
    });

    // Verificar longitud excesiva
    if (data.html_body.length > 10000) {
      warnings.push('El contenido es muy extenso, considera reducirlo');
    }

    // Verificar enlaces sospechosos
    const suspiciousLinks = /https?:\/\/(?![\w.-]*\.(com|org|net|edu|gov))/gi;
    if (suspiciousLinks.test(data.html_body)) {
      warnings.push('Se detectaron enlaces con dominios inusuales');
    }

    setSecurityWarnings(warnings);
    return warnings.length === 0;
  };

  const onSubmit = async (data: CampaignFormData) => {
    try {
      // Validación de seguridad
      const isSecure = validateSecurityContent(data);
      if (!isSecure) {
        secureLogger.security('campaign_security_validation_failed', 'medium', {
          warnings: securityWarnings,
          subjectLength: data.subject.length,
          bodyLength: data.html_body.length
        });
        return;
      }

      // Sanitizar datos antes del envío
      const sanitizedData = {
        ...data,
        subject: sanitizeString(data.subject),
        html_body: sanitizeString(data.html_body)
      };

      secureLogger.info('Sending secure campaign', {
        audience: sanitizedData.audience,
        subjectLength: sanitizedData.subject.length,
        bodyLength: sanitizedData.html_body.length
      });

      await sendCampaign(sanitizedData);
      form.reset();
      setSecurityWarnings([]);
      onSuccess?.();
    } catch (error) {
      secureLogger.error('Campaign form submission error', {}, error as Error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Crear Campaña Segura
        </CardTitle>
      </CardHeader>
      <CardContent>
        {securityWarnings.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Advertencias de seguridad:</strong>
              <ul className="mt-2 list-disc list-inside">
                {securityWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audiencia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la audiencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="investors">Inversores</SelectItem>
                      <SelectItem value="companies">Empresas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Asunto de la campaña..."
                      {...field}
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="html_body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido del Email</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe el contenido de tu campaña..."
                      className="min-h-[300px]"
                      {...field}
                      maxLength={50000}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSending || securityWarnings.length > 0}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Enviando...' : 'Enviar Campaña'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
