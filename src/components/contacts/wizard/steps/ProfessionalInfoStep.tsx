
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfessionalInfoStepProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export const ProfessionalInfoStep = ({ formData, onInputChange, errors }: ProfessionalInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información Profesional
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Detalles sobre la posición profesional y empresa del contacto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa/Organización</Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => onInputChange('company', e.target.value)}
            placeholder="Nombre de la empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Cargo/Posición</Label>
          <Input
            id="position"
            value={formData.position || ''}
            onChange={(e) => onInputChange('position', e.target.value)}
            placeholder="CEO, Director, Gerente, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url">Perfil de LinkedIn</Label>
          <Input
            id="linkedin_url"
            value={formData.linkedin_url || ''}
            onChange={(e) => onInputChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/usuario"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url">Sitio Web de la Empresa</Label>
          <Input
            id="website_url"
            value={formData.website_url || ''}
            onChange={(e) => onInputChange('website_url', e.target.value)}
            placeholder="https://empresa.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_contact_method">Método de Contacto Preferido</Label>
          <select
            id="preferred_contact_method"
            value={formData.preferred_contact_method || 'email'}
            onChange={(e) => onInputChange('preferred_contact_method', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="email">Email</option>
            <option value="phone">Teléfono</option>
            <option value="linkedin">LinkedIn</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="video_call">Video Llamada</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time_zone">Zona Horaria</Label>
          <select
            id="time_zone"
            value={formData.time_zone || ''}
            onChange={(e) => onInputChange('time_zone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar zona horaria</option>
            <option value="Europe/Madrid">Madrid (CET)</option>
            <option value="Europe/London">Londres (GMT)</option>
            <option value="America/New_York">Nueva York (EST)</option>
            <option value="America/Los_Angeles">Los Ángeles (PST)</option>
            <option value="America/Mexico_City">Ciudad de México (CST)</option>
            <option value="America/Sao_Paulo">São Paulo (BRT)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language_preference">Idioma Preferido</Label>
        <select
          id="language_preference"
          value={formData.language_preference || 'es'}
          onChange={(e) => onInputChange('language_preference', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
        </select>
      </div>
    </div>
  );
};
