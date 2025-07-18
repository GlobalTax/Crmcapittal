import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TransaccionTeaserBuilderProps {
  transaccion: any;
  teaser?: any;
  onClose: () => void;
  onSave: () => void;
}

export function TransaccionTeaserBuilder({ transaccion, teaser, onClose, onSave }: TransaccionTeaserBuilderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    anonymous_company_name: '',
    sector: '',
    location: '',
    revenue: '',
    ebitda: '',
    employees: '',
    description: '',
    key_highlights: [] as string[],
    status: 'borrador' as const
  });

  // Generar nombre anónimo automáticamente
  const generateAnonymousName = () => {
    const sectors: Record<string, string[]> = {
      'tecnologia': ['TechCorp', 'InnovaSoft', 'DigitalPlus', 'SoftTech', 'DataSystems'],
      'manufactura': ['IndustrialCorp', 'ManufacPlus', 'ProductionCo', 'IndustriaX', 'FabricaTech'],
      'servicios': ['ServiciosPro', 'ConsultingPlus', 'ServiceCorp', 'ExpertGroup', 'SolutionsCo'],
      'retail': ['ComercialPlus', 'RetailCorp', 'VentasPro', 'ComercioX', 'DistribuidoraCo'],
      'healthcare': ['MedicalCorp', 'HealthPlus', 'SaludTech', 'ClinicalGroup', 'BioMedical'],
      'default': ['EmpresaLíder', 'CorporaciónX', 'GrupoIndustrial', 'CompañíaPro', 'OrganizaciónPlus']
    };

    const sectorKey = formData.sector.toLowerCase();
    const names = sectors[sectorKey] || sectors.default;
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    setFormData(prev => ({
      ...prev,
      anonymous_company_name: randomName + ' (' + (formData.location || 'España') + ')'
    }));
  };

  // Inicializar formulario con datos de la transacción
  useEffect(() => {
    if (teaser) {
      // Modo edición
      setFormData({
        title: teaser.title || '',
        anonymous_company_name: teaser.anonymous_company_name || '',
        sector: teaser.sector || '',
        location: teaser.location || '',
        revenue: teaser.revenue?.toString() || '',
        ebitda: teaser.ebitda?.toString() || '',
        employees: teaser.employees?.toString() || '',
        description: teaser.description || '',
        key_highlights: teaser.key_highlights || [],
        status: teaser.status || 'borrador'
      });
    } else {
      // Modo creación - auto-completar con datos de la transacción
      setFormData(prev => ({
        ...prev,
        title: `Teaser - ${transaccion.nombre_transaccion}`,
        sector: transaccion.sector || '',
        location: transaccion.ubicacion || transaccion.location || '',
        revenue: transaccion.facturacion?.toString() || transaccion.revenue?.toString() || '',
        ebitda: transaccion.ebitda?.toString() || '',
        employees: transaccion.empleados?.toString() || transaccion.employees?.toString() || ''
      }));
    }
  }, [transaccion, teaser]);

  // Auto-generar nombre anónimo cuando cambia el sector o ubicación
  useEffect(() => {
    if (!teaser && (formData.sector || formData.location)) {
      generateAnonymousName();
    }
  }, [formData.sector, formData.location, teaser]);

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

  const handleSave = async () => {
    setLoading(true);
    try {
      const teaserData = {
        title: formData.title,
        anonymous_company_name: formData.anonymous_company_name,
        sector: formData.sector,
        location: formData.location,
        revenue: formData.revenue ? parseFloat(formData.revenue) : null,
        ebitda: formData.ebitda ? parseFloat(formData.ebitda) : null,
        employees: formData.employees ? parseInt(formData.employees) : null,
        description: formData.description,
        key_highlights: formData.key_highlights.filter(h => h.trim() !== ''),
        status: formData.status,
        transaction_id: transaccion.id,
        teaser_type: 'venta',
        project_code: `TXN-${transaccion.id.slice(0, 8)}`
      };

      if (teaser) {
        // Actualizar teaser existente
        const { error } = await supabase
          .from('teasers')
          .update(teaserData)
          .eq('id', teaser.id);

        if (error) throw error;
        toast({ title: 'Teaser actualizado correctamente' });
      } else {
        // Crear nuevo teaser
        const { error } = await supabase
          .from('teasers')
          .insert(teaserData);

        if (error) throw error;
        toast({ title: 'Teaser creado correctamente' });
      }

      onSave();
    } catch (error) {
      console.error('Error saving teaser:', error);
      toast({
        title: 'Error al guardar el teaser',
        description: 'Por favor, inténtelo de nuevo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {teaser ? 'Editar Teaser' : 'Crear Teaser'}
            </h2>
            <p className="text-muted-foreground">
              {teaser ? 'Modifica el teaser existente' : 'Crear perfil ciego para'} {transaccion.nombre_transaccion}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Datos principales del teaser anónimo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del Teaser</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Título interno del teaser"
              />
            </div>

            <div>
              <Label htmlFor="anonymous_name">Nombre Anónimo</Label>
              <div className="flex gap-2">
                <Input
                  id="anonymous_name"
                  value={formData.anonymous_company_name}
                  onChange={(e) => handleInputChange('anonymous_company_name', e.target.value)}
                  placeholder="Nombre público de la empresa"
                />
                <Button 
                  variant="outline" 
                  onClick={generateAnonymousName}
                  type="button"
                >
                  Generar
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                placeholder="Sector de actividad"
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ubicación geográfica"
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

        {/* Métricas Financieras */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Financieras</CardTitle>
            <CardDescription>
              Datos financieros anonimizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="revenue">Facturación Anual (€)</Label>
              <Input
                id="revenue"
                type="number"
                value={formData.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
                placeholder="Facturación en euros"
              />
            </div>

            <div>
              <Label htmlFor="ebitda">EBITDA (€)</Label>
              <Input
                id="ebitda"
                type="number"
                value={formData.ebitda}
                onChange={(e) => handleInputChange('ebitda', e.target.value)}
                placeholder="EBITDA en euros"
              />
            </div>

            <div>
              <Label htmlFor="employees">Número de Empleados</Label>
              <Input
                id="employees"
                type="number"
                value={formData.employees}
                onChange={(e) => handleInputChange('employees', e.target.value)}
                placeholder="Cantidad de empleados"
              />
            </div>
          </CardContent>
        </Card>

        {/* Descripción */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
            <CardDescription>
              Descripción anonimizada de la empresa y oportunidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción detallada de la oportunidad de inversión..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Puntos Clave */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Puntos Clave</CardTitle>
                <CardDescription>
                  Destacados principales de la oportunidad
                </CardDescription>
              </div>
              <Button variant="outline" onClick={addHighlight}>
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
              {formData.key_highlights.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No hay puntos clave definidos. Haz clic en "Añadir Punto" para comenzar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}