import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileText, Calendar, User, Building } from 'lucide-react';
import { RODGeneralInfo } from '@/hooks/useRODFormState';

const generalInfoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  client: z.string().optional(),
  period: z.string().optional(),
});

interface GeneralInfoFormProps {
  initialData: RODGeneralInfo;
  onSave: (data: RODGeneralInfo) => void;
  onNext: () => void;
}

export function GeneralInfoForm({ initialData, onSave, onNext }: GeneralInfoFormProps) {
  const form = useForm<RODGeneralInfo>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: RODGeneralInfo) => {
    onSave(data);
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Información General de la ROD
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configura la información básica del reporte de oportunidades de dealflow
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Título de la ROD
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: ROD Semanal - Enero 2024"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción General</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el propósito y alcance de esta ROD..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente/Destinatario
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nombre del cliente o destinatario"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Período
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: Q1 2024, Enero 2024"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="px-8">
                Continuar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}