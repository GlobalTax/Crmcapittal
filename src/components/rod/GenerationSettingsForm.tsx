import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, FileText, Download, Mail, Image } from 'lucide-react';
import { RODGenerationSettings } from '@/hooks/useRODFormState';

interface GenerationSettingsFormProps {
  initialData: RODGenerationSettings;
  onSave: (data: RODGenerationSettings) => void;
  onNext: () => void;
  onPrev: () => void;
}

const templates = [
  { value: 'professional', label: 'Profesional' },
  { value: 'executive', label: 'Ejecutivo' },
  { value: 'detailed', label: 'Detallado' },
  { value: 'summary', label: 'Resumen' },
];

const outputFormats = [
  { value: 'pdf', label: 'PDF' },
  { value: 'html', label: 'HTML' },
  { value: 'docx', label: 'Word (DOCX)' },
];

const distributionMethods = [
  { value: 'download', label: 'Descargar' },
  { value: 'email', label: 'Enviar por Email' },
  { value: 'both', label: 'Descargar y Enviar' },
];

export function GenerationSettingsForm({ 
  initialData, 
  onSave, 
  onNext, 
  onPrev 
}: GenerationSettingsFormProps) {
  const form = useForm<RODGenerationSettings>({
    defaultValues: initialData,
  });

  const onSubmit = (data: RODGenerationSettings) => {
    onSave(data);
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Generación
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personaliza el formato y la distribución de tu ROD
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Plantilla
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una plantilla" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outputFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Formato de Salida
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el formato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {outputFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distributionMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Método de Distribución
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {distributionMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includeLogos"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Image className="h-4 w-4" />
                      Incluir Logos
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Incluir logos de la empresa en el documento ROD
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrev}>
                Anterior
              </Button>
              <Button type="submit">
                Vista Previa
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}