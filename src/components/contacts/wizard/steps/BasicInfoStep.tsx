
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_TYPES } from '@/types/Contact';

interface BasicInfoStepProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const BasicInfoStep = ({ formData, onInputChange, errors }: BasicInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información Básica del Contacto
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Proporciona la información fundamental del contacto para comenzar a construir su perfil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Ej: Juan Pérez García"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Profesional</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="juan.perez@empresa.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono de Contacto</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="+34 600 123 456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_type">Tipo de Contacto *</Label>
          <select
            id="contact_type"
            value={formData.contact_type || 'other'}
            onChange={(e) => onInputChange('contact_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CONTACT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_source">Fuente del Contacto</Label>
          <select
            id="contact_source"
            value={formData.contact_source || ''}
            onChange={(e) => onInputChange('contact_source', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar fuente</option>
            <option value="linkedin">LinkedIn</option>
            <option value="referral">Referencia</option>
            <option value="website">Sitio Web</option>
            <option value="conference">Conferencia/Evento</option>
            <option value="cold_outreach">Prospección Directa</option>
            <option value="partner">Partner/Aliado</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_priority">Prioridad</Label>
          <select
            id="contact_priority"
            value={formData.contact_priority || 'medium'}
            onChange={(e) => onInputChange('contact_priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas Iniciales</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => onInputChange('notes', e.target.value)}
          placeholder="Información adicional relevante sobre el contacto..."
          rows={4}
        />
      </div>
    </div>
  );
};
