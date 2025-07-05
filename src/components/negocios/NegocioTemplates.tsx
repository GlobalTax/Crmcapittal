import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Building2, 
  TrendingUp,
  Briefcase,
  Factory
} from 'lucide-react';
import { Negocio } from '@/types/Negocio';

export interface NegocioTemplate {
  id: string;
  name: string;
  description: string;
  category: 'venta' | 'compra' | 'fusion' | 'valoracion' | 'consultoria';
  icon: React.ReactNode;
  defaults: Partial<Negocio>;
}

const TEMPLATES: NegocioTemplate[] = [
  {
    id: 'tech-startup-sale',
    name: 'Venta de Startup Tecnológica',
    description: 'Template para la venta de empresas tecnológicas en etapa temprana',
    category: 'venta',
    icon: <TrendingUp className="h-5 w-5" />,
    defaults: {
      tipo_negocio: 'venta',
      sector: 'Tecnología',
      prioridad: 'alta',
      moneda: 'EUR',
      multiplicador: 15,
      descripcion: 'Venta de startup tecnológica con potencial de crecimiento',
    }
  },
  {
    id: 'manufacturing-acquisition',
    name: 'Adquisición Industrial',
    description: 'Template para adquisiciones de empresas manufactureras',
    category: 'compra',
    icon: <Factory className="h-5 w-5" />,
    defaults: {
      tipo_negocio: 'compra',
      sector: 'Manufacturero',
      prioridad: 'media',
      moneda: 'EUR',
      multiplicador: 8,
      descripcion: 'Adquisición de empresa manufacturera establecida',
    }
  },
  {
    id: 'real-estate-valuation',
    name: 'Valoración Inmobiliaria',
    description: 'Template para valoraciones de activos inmobiliarios',
    category: 'valoracion',
    icon: <Building2 className="h-5 w-5" />,
    defaults: {
      tipo_negocio: 'valoracion',
      sector: 'Inmobiliario',
      prioridad: 'media',
      moneda: 'EUR',
      descripcion: 'Valoración de activos inmobiliarios comerciales',
    }
  },
  {
    id: 'business-consulting',
    name: 'Consultoría Estratégica',
    description: 'Template para proyectos de consultoría empresarial',
    category: 'consultoria',
    icon: <Briefcase className="h-5 w-5" />,
    defaults: {
      tipo_negocio: 'consultoria',
      prioridad: 'media',
      moneda: 'EUR',
      descripcion: 'Proyecto de consultoría estratégica y optimización',
    }
  }
];

interface NegocioTemplatesProps {
  onCreateFromTemplate: (template: NegocioTemplate) => void;
}

export const NegocioTemplates: React.FC<NegocioTemplatesProps> = ({
  onCreateFromTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<NegocioTemplate | null>(null);
  const [customValues, setCustomValues] = useState<Partial<Negocio>>({});

  const handleTemplateSelect = (template: NegocioTemplate) => {
    setSelectedTemplate(template);
    setCustomValues(template.defaults);
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplate) {
      const finalTemplate = {
        ...selectedTemplate,
        defaults: { ...selectedTemplate.defaults, ...customValues }
      };
      onCreateFromTemplate(finalTemplate);
      setSelectedTemplate(null);
      setCustomValues({});
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'venta': return 'bg-green-100 text-green-800';
      case 'compra': return 'bg-blue-100 text-blue-800';
      case 'fusion': return 'bg-purple-100 text-purple-800';
      case 'valoracion': return 'bg-orange-100 text-orange-800';
      case 'consultoria': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Negocio desde Template</DialogTitle>
          <DialogDescription>
            Selecciona un template predefinido para crear un negocio rápidamente
          </DialogDescription>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                {selectedTemplate.icon}
              </div>
              <div>
                <h4 className="font-medium">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_negocio">Nombre del Negocio *</Label>
                <Input
                  id="nombre_negocio"
                  value={customValues.nombre_negocio || ''}
                  onChange={(e) => setCustomValues(prev => ({
                    ...prev,
                    nombre_negocio: e.target.value
                  }))}
                  placeholder="Nombre del negocio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_negocio">Valor del Negocio</Label>
                <Input
                  id="valor_negocio"
                  type="number"
                  value={customValues.valor_negocio || ''}
                  onChange={(e) => setCustomValues(prev => ({
                    ...prev,
                    valor_negocio: parseInt(e.target.value) || undefined
                  }))}
                  placeholder="Valor estimado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  value={customValues.sector || selectedTemplate.defaults.sector || ''}
                  onChange={(e) => setCustomValues(prev => ({
                    ...prev,
                    sector: e.target.value
                  }))}
                  placeholder="Sector de la empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select 
                  value={customValues.prioridad || selectedTemplate.defaults.prioridad}
                  onValueChange={(value) => setCustomValues(prev => ({
                    ...prev,
                    prioridad: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={customValues.descripcion || selectedTemplate.defaults.descripcion || ''}
                  onChange={(e) => setCustomValues(prev => ({
                    ...prev,
                    descripcion: e.target.value
                  }))}
                  placeholder="Descripción del negocio"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {selectedTemplate ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
              >
                Volver
              </Button>
              <Button 
                onClick={handleCreateFromTemplate}
                disabled={!customValues.nombre_negocio}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Negocio
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => {}}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};