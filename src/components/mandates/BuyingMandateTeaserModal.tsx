import React, { useState } from 'react';
import { X, FileImage, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/productionLogger';

interface BuyingMandateTeaserModalProps {
  mandate: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyingMandateTeaserModal({ mandate, open, onOpenChange }: BuyingMandateTeaserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: `Perfil de Oportunidad - ${mandate.mandate_name}`,
    anonymous_company_name: 'Oportunidad de Adquisición',
    sector: mandate.target_sectors?.[0] || '',
    location: mandate.target_locations?.[0] || '',
    revenue_min: mandate.min_revenue?.toString() || '',
    revenue_max: mandate.max_revenue?.toString() || '',
    ebitda_min: mandate.min_ebitda?.toString() || '',
    ebitda_max: mandate.max_ebitda?.toString() || '',
    description: '',
    key_highlights: ['Oportunidad de adquisición estratégica', 'Sector en crecimiento'] as string[],
    status: 'activo' as const
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      key_highlights: [...prev.key_highlights, '']
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      key_highlights: prev.key_highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_highlights: prev.key_highlights.filter((_, i) => i !== index)
    }));
  };

  const generateDescription = () => {
    const description = `
Estamos buscando oportunidades de adquisición en el sector ${formData.sector}${formData.location ? ` en la región de ${formData.location}` : ''}.

Criterios de búsqueda:
${formData.revenue_min || formData.revenue_max ? `• Facturación: ${formData.revenue_min ? `desde €${parseInt(formData.revenue_min).toLocaleString()}` : ''}${formData.revenue_max ? ` hasta €${parseInt(formData.revenue_max).toLocaleString()}` : ''}` : ''}
${formData.ebitda_min || formData.ebitda_max ? `• EBITDA: ${formData.ebitda_min ? `desde €${parseInt(formData.ebitda_min).toLocaleString()}` : ''}${formData.ebitda_max ? ` hasta €${parseInt(formData.ebitda_max).toLocaleString()}` : ''}` : ''}

${mandate.other_criteria ? `Criterios adicionales: ${mandate.other_criteria}` : ''}

Estamos preparados para actuar rápidamente en las oportunidades adecuadas.
    `.trim();
    
    setFormData(prev => ({ ...prev, description }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const teaserData = {
        title: formData.title,
        anonymous_company_name: formData.anonymous_company_name,
        sector: formData.sector,
        location: formData.location,
        description: formData.description,
        key_highlights: formData.key_highlights.filter(h => h.trim() !== ''),
        status: formData.status,
        mandate_id: mandate.id,
        transaction_id: `mandate-${mandate.id}`, // ID temporal para mandatos
        teaser_type: 'compra',
        project_code: `BUY-${mandate.id.slice(0, 8)}`,
        // Para mandatos de compra, usamos rangos en lugar de valores específicos
        asking_price: formData.revenue_max ? parseFloat(formData.revenue_max) : null,
        revenue: formData.revenue_max ? parseFloat(formData.revenue_max) : null,
        ebitda: formData.ebitda_max ? parseFloat(formData.ebitda_max) : null
      };

      const { error } = await supabase
        .from('teasers')
        .insert(teaserData);

      if (error) throw error;
      
      toast({ title: 'Perfil de oportunidad creado correctamente' });
      onOpenChange(false);
    } catch (error) {
      logger.error('Failed to create buying mandate teaser', { error, mandateId: mandate.id });
      toast({
        title: 'Error al crear el perfil',
        description: 'Por favor, inténtelo de nuevo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Crear Perfil de Oportunidad de Compra
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Define el perfil de oportunidad que buscas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Perfil</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Título interno del perfil"
                  />
                </div>

                <div>
                  <Label htmlFor="anonymous_name">Nombre Público</Label>
                  <Input
                    id="anonymous_name"
                    value={formData.anonymous_company_name}
                    onChange={(e) => handleInputChange('anonymous_company_name', e.target.value)}
                    placeholder="Nombre que verán los potenciales vendedores"
                  />
                </div>

                <div>
                  <Label htmlFor="sector">Sector Objetivo</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    placeholder="Sector de interés"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Ubicación Preferida</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ubicación geográfica preferida"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Criterios Financieros */}
            <Card>
              <CardHeader>
                <CardTitle>Criterios Financieros</CardTitle>
                <CardDescription>
                  Rangos de facturación y EBITDA objetivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revenue_min">Facturación Mínima (€)</Label>
                    <Input
                      id="revenue_min"
                      type="number"
                      value={formData.revenue_min}
                      onChange={(e) => handleInputChange('revenue_min', e.target.value)}
                      placeholder="Mínimo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue_max">Facturación Máxima (€)</Label>
                    <Input
                      id="revenue_max"
                      type="number"
                      value={formData.revenue_max}
                      onChange={(e) => handleInputChange('revenue_max', e.target.value)}
                      placeholder="Máximo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ebitda_min">EBITDA Mínimo (€)</Label>
                    <Input
                      id="ebitda_min"
                      type="number"
                      value={formData.ebitda_min}
                      onChange={(e) => handleInputChange('ebitda_min', e.target.value)}
                      placeholder="Mínimo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ebitda_max">EBITDA Máximo (€)</Label>
                    <Input
                      id="ebitda_max"
                      type="number"
                      value={formData.ebitda_max}
                      onChange={(e) => handleInputChange('ebitda_max', e.target.value)}
                      placeholder="Máximo"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Descripción */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Descripción del Perfil</CardTitle>
                  <CardDescription>
                    Descripción detallada de lo que buscas
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={generateDescription}>
                  Generar Automáticamente
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el tipo de empresa que buscas adquirir..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Puntos Clave */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Puntos Clave</CardTitle>
                  <CardDescription>
                    Aspectos destacados de tu búsqueda
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={addHighlight}>
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Punto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.key_highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder={`Punto clave ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeHighlight(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Crear Perfil'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}