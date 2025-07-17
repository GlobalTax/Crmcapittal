import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Users, Clock, CheckCircle, Info } from 'lucide-react';
import { RODGeneralInfo } from '@/hooks/useRODFormState';
import { useSubscribers } from '@/hooks/useSubscribers';

const generalInfoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  selectedSubscribers: z.array(z.string()).min(1, 'Selecciona al menos un destinatario'),
  period: z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2024),
  }),
});

interface GeneralInfoFormProps {
  initialData: RODGeneralInfo;
  onSave: (data: RODGeneralInfo) => void;
  onNext: () => void;
}

const months = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

// Simulamos RODs existentes para bloquear períodos
const existingRODs = [
  { month: 1, year: 2025 },
  { month: 3, year: 2025 },
];

export function GeneralInfoForm({ initialData, onSave, onNext }: GeneralInfoFormProps) {
  const { subscribers, isLoading } = useSubscribers();
  
  const form = useForm<RODGeneralInfo>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: initialData,
  });

  const watchedPeriod = useWatch({
    control: form.control,
    name: 'period',
  });

  // Auto-generate title when period changes
  useEffect(() => {
    if (watchedPeriod?.month && watchedPeriod?.year) {
      const monthName = months.find(m => m.value === watchedPeriod.month)?.label;
      const title = `ROD ${monthName} ${watchedPeriod.year}`;
      form.setValue('title', title);
    }
  }, [watchedPeriod, form]);

  const onSubmit = (data: RODGeneralInfo) => {
    onSave(data);
    onNext();
  };

  const isPeriodBlocked = (month: number, year: number) => {
    return existingRODs.some(rod => rod.month === month && rod.year === year);
  };

  const selectedSubscribers = form.watch('selectedSubscribers') || [];
  const subscribersBySegment = subscribers?.reduce((acc, sub) => {
    if (!acc[sub.segment]) acc[sub.segment] = [];
    acc[sub.segment].push(sub);
    return acc;
  }, {} as Record<string, typeof subscribers>) || {};

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            Información General de la ROD
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Configura la información básica del reporte de oportunidades de dealflow
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Auto-generated Title Display */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  Título Generado Automáticamente
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
                  <p className="text-lg font-semibold text-foreground">
                    {form.watch('title') || 'ROD [Mes] [Año]'}
                  </p>
                </div>
              </div>

              {/* Period Selection */}
              <div className="space-y-4">
                <FormLabel className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-5 w-5 text-primary" />
                  Período de la ROD
                </FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="period.month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mes</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Selecciona mes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => {
                              const isBlocked = isPeriodBlocked(month.value, form.watch('period.year'));
                              return (
                                <SelectItem 
                                  key={month.value} 
                                  value={month.value.toString()}
                                  disabled={isBlocked}
                                >
                                  <div className="flex items-center gap-2">
                                    {month.label}
                                    {isBlocked && (
                                      <Badge variant="secondary" className="text-xs">
                                        Ya existe
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="period.year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Selecciona año" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[2024, 2025, 2026].map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isPeriodBlocked(form.watch('period.month'), form.watch('period.year')) && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Ya existe una ROD para este período. Selecciona otro mes.
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Descripción General</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe el propósito y alcance de esta ROD..."
                        className="min-h-[120px] text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subscribers Selection */}
              <FormField
                control={form.control}
                name="selectedSubscribers"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="flex items-center gap-2 text-base font-semibold">
                        <Users className="h-5 w-5 text-primary" />
                        Destinatarios de la ROD
                      </FormLabel>
                      <Badge variant="outline" className="px-3 py-1">
                        {selectedSubscribers.length} seleccionados
                      </Badge>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Cargando suscriptores...</span>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-4">
                        {Object.entries(subscribersBySegment).map(([segment, segmentSubscribers]) => (
                          <div key={segment} className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              {segment}
                            </h4>
                            <div className="space-y-2 ml-4">
                              {segmentSubscribers.map((subscriber) => (
                                <div key={subscriber.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={subscriber.id}
                                    checked={selectedSubscribers.includes(subscriber.id)}
                                    onCheckedChange={(checked) => {
                                      const current = form.getValues('selectedSubscribers') || [];
                                      if (checked) {
                                        form.setValue('selectedSubscribers', [...current, subscriber.id]);
                                      } else {
                                        form.setValue('selectedSubscribers', current.filter(id => id !== subscriber.id));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={subscriber.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {subscriber.email}
                                  </label>
                                  {!subscriber.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      No verificado
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  className="px-8 h-12 text-base font-semibold"
                  disabled={isPeriodBlocked(form.watch('period.month'), form.watch('period.year'))}
                >
                  Continuar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}