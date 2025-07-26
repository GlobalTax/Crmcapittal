import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building, AlertCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import type { ReconversionFormData } from '@/types/Reconversion';

interface BuyerInfoStepProps {
  form: UseFormReturn<ReconversionFormData>;
}

export function BuyerInfoStep({ form }: BuyerInfoStepProps) {
  const { register, setValue, watch, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>
            Datos básicos de la empresa interesada en la reconversión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Nombre de la Empresa *
              </Label>
              <Input
                id="company_name"
                {...register('company_name', { 
                  required: 'Este campo es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                placeholder="Ej: Inversiones ABC S.L."
              />
              {errors.company_name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select onValueChange={(value) => setValue('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baja</SelectItem>
                  <SelectItem value="medium">🟡 Media</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Contacto Principal
          </CardTitle>
          <CardDescription>
            Persona de contacto para esta reconversión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">
                Nombre del Contacto *
              </Label>
              <Input
                id="contact_name"
                {...register('contact_name', { 
                  required: 'Este campo es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                })}
                placeholder="Ej: Juan Pérez García"
              />
              {errors.contact_name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contact_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">
                Email del Contacto *
              </Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email', { 
                  required: 'Este campo es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                placeholder="juan@ejemplo.com"
              />
              {errors.contact_email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contact_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono del Contacto</Label>
              <Input
                id="contact_phone"
                {...register('contact_phone')}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5" />
            Motivo del Rechazo
          </CardTitle>
          <CardDescription>
            Explica por qué se rechazó inicialmente la oportunidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">
              Descripción del motivo *
            </Label>
            <Textarea
              id="rejection_reason"
              {...register('rejection_reason', { 
                required: 'Este campo es obligatorio',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' }
              })}
              placeholder="Ej: La operación no encajaba con nuestro mandato actual debido a que buscábamos empresas del sector tecnológico y esta era del sector industrial..."
              rows={4}
            />
            {errors.rejection_reason && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.rejection_reason.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}