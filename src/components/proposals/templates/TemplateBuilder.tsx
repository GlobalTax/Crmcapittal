import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProposalTemplates } from '@/hooks/useProposalTemplates';
import { ProposalTemplate, TemplateSection, TEMPLATE_VARIABLES } from '@/types/ProposalTemplate';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, X, Eye, Save, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ProposalTemplate | null;
  onSave?: (template: ProposalTemplate) => void;
}

const SECTION_TYPES = [
  { value: 'text', label: 'Texto/Introducción', icon: '📝' },
  { value: 'services', label: 'Servicios', icon: '🛠️' },
  { value: 'fees', label: 'Honorarios', icon: '💰' },
  { value: 'timeline', label: 'Timeline/Cronograma', icon: '📅' },
  { value: 'terms', label: 'Términos y Condiciones', icon: '📋' },
  { value: 'signature', label: 'Firma/Aceptación', icon: '✍️' }
];

const PRESET_COLORS = [
  { name: 'Azul Profesional', primary: '#2563eb', secondary: '#64748b' },
  { name: 'Verde Financiero', primary: '#059669', secondary: '#6b7280' },
  { name: 'Púrpura Consultora', primary: '#7c3aed', secondary: '#71717a' },
  { name: 'Naranja M&A', primary: '#ea580c', secondary: '#78716c' },
  { name: 'Gris Elegante', primary: '#374151', secondary: '#9ca3af' }
];

export const TemplateBuilder = ({ open, onOpenChange, template, onSave }: TemplateBuilderProps) => {
  const { createTemplate, updateTemplate } = useProposalTemplates();
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [templateDescription, setTemplateDescription] = useState(template?.description || '');
  const [templateCategory, setTemplateCategory] = useState<ProposalTemplate['category']>(template?.category || 'Consultoria');
  const [sections, setSections] = useState<TemplateSection[]>(template?.content_structure || []);
  const [visualConfig, setVisualConfig] = useState(template?.visual_config || {
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    font_family: 'Inter'
  });
  const [activeTab, setActiveTab] = useState<'structure' | 'design'>('structure');

  const handleAddSection = (type: TemplateSection['type']) => {
    const newSection: TemplateSection = {
      id: `section_${Date.now()}`,
      type,
      title: getSectionTypeLabel(type),
      content: getSectionPlaceholder(type),
      order: sections.length + 1,
      required: type === 'services' || type === 'fees',
      editable: true
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleSectionChange = (sectionId: string, field: keyof TemplateSection, value: any) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedSections = [...sections];
    const [removed] = reorderedSections.splice(oldIndex, 1);
    reorderedSections.splice(newIndex, 0, removed);

    // Update order numbers
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));

    setSections(updatedSections);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('El nombre del template es requerido');
      return;
    }

    if (sections.length === 0) {
      toast.error('Debe agregar al menos una sección');
      return;
    }

    const templateData = {
      name: templateName,
      description: templateDescription,
      category: templateCategory,
      content_structure: sections,
      visual_config: visualConfig
    };

    try {
      let savedTemplate;
      if (template) {
        await updateTemplate(template.id, templateData);
        savedTemplate = { ...template, ...templateData };
      } else {
        savedTemplate = await createTemplate(templateData);
      }

      if (savedTemplate) {
        toast.success(`Template ${template ? 'actualizado' : 'creado'} exitosamente`);
        onSave?.(savedTemplate);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const getSectionTypeLabel = (type: TemplateSection['type']) => {
    return SECTION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getSectionPlaceholder = (type: TemplateSection['type']) => {
    const placeholders = {
      text: 'Propuesta de servicios profesionales para {{cliente.nombre}} en el sector {{empresa.sector}}.',
      services: '- Análisis inicial\n- Desarrollo de estrategia\n- Implementación\n- Seguimiento',
      fees: 'Honorarios: {{honorarios.fijos}}€ + IVA\nForma de pago: 50% al inicio, 50% a la entrega',
      timeline: 'Duración estimada: {{proyecto.duracion}} semanas\nEntrega: {{fecha.entrega}}',
      terms: 'Propuesta válida por {{vigencia.dias}} días.\nCondiciones generales según contrato marco.',
      signature: 'Para aceptar esta propuesta, por favor firme y devuelva este documento.'
    };
    return placeholders[type] || '';
  };

  const insertVariable = (sectionId: string, variable: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      const newContent = (section.content || '') + `{{${variable}}}`;
      handleSectionChange(sectionId, 'content', newContent);
    }
  };

// Draggable Section Component
const DraggableSection = ({ 
  section, 
  index, 
  onSectionChange, 
  onRemoveSection, 
  onInsertVariable, 
  getSectionTypeLabel, 
  getSectionPlaceholder 
}: {
  section: TemplateSection;
  index: number;
  onSectionChange: (sectionId: string, field: keyof TemplateSection, value: any) => void;
  onRemoveSection: (sectionId: string) => void;
  onInsertVariable: (sectionId: string, variable: string) => void;
  getSectionTypeLabel: (type: TemplateSection['type']) => string;
  getSectionPlaceholder: (type: TemplateSection['type']) => string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-card ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        </div>
        <Badge variant="secondary">
          {getSectionTypeLabel(section.type)}
        </Badge>
        <Input
          value={section.title}
          onChange={(e) => onSectionChange(section.id, 'title', e.target.value)}
          className="flex-1"
          placeholder="Título de la sección"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveSection(section.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        value={section.content || ''}
        onChange={(e) => onSectionChange(section.id, 'content', e.target.value)}
        placeholder={getSectionPlaceholder(section.type)}
        rows={4}
        className="mb-3"
      />

      <div className="flex flex-wrap gap-1">
        <span className="text-xs text-muted-foreground mr-2">Variables:</span>
        {TEMPLATE_VARIABLES.slice(0, 6).map((variable) => (
          <Button
            key={variable.key}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onInsertVariable(section.id, variable.key)}
          >
            {variable.key}
          </Button>
        ))}
      </div>
    </div>
  );
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template' : 'Crear Nuevo Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nombre del Template</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej: M&A Advisory Premium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-category">Categoría</Label>
              <Select value={templateCategory} onValueChange={(value: any) => setTemplateCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M&A">M&A</SelectItem>
                  <SelectItem value="Valoracion">Valoración</SelectItem>
                  <SelectItem value="Consultoria">Consultoría</SelectItem>
                  <SelectItem value="Due Diligence">Due Diligence</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Descripción</Label>
            <Textarea
              id="template-description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe cuándo usar este template..."
              rows={2}
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'structure' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('structure')}
            >
              📝 Estructura de Contenido
            </button>
            <button
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'design' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('design')}
            >
              🎨 Diseño Visual
            </button>
          </div>

          {/* Content */}
          {activeTab === 'structure' && (
            <div className="space-y-4">
              {/* Add Section Buttons */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Agregar Sección</Label>
                <div className="flex flex-wrap gap-2">
                  {SECTION_TYPES.map((sectionType) => (
                    <Button
                      key={sectionType.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSection(sectionType.value as TemplateSection['type'])}
                      className="text-xs"
                    >
                      <span className="mr-1">{sectionType.icon}</span>
                      {sectionType.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <DraggableSection
                        key={section.id}
                        section={section}
                        index={index}
                        onSectionChange={handleSectionChange}
                        onRemoveSection={handleRemoveSection}
                        onInsertVariable={insertVariable}
                        getSectionTypeLabel={getSectionTypeLabel}
                        getSectionPlaceholder={getSectionPlaceholder}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {sections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay secciones agregadas. Usa los botones de arriba para agregar contenido.
                </div>
              )}
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Colores Predefinidos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRESET_COLORS.map((preset) => (
                    <Card 
                      key={preset.name}
                      className={`cursor-pointer transition-all ${
                        visualConfig.primary_color === preset.primary 
                          ? 'ring-2 ring-primary' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setVisualConfig({
                        ...visualConfig,
                        primary_color: preset.primary,
                        secondary_color: preset.secondary
                      })}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <span className="text-sm font-medium">{preset.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={visualConfig.primary_color}
                      onChange={(e) => setVisualConfig({
                        ...visualConfig,
                        primary_color: e.target.value
                      })}
                      className="w-16"
                    />
                    <Input
                      value={visualConfig.primary_color}
                      onChange={(e) => setVisualConfig({
                        ...visualConfig,
                        primary_color: e.target.value
                      })}
                      placeholder="#2563eb"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={visualConfig.secondary_color}
                      onChange={(e) => setVisualConfig({
                        ...visualConfig,
                        secondary_color: e.target.value
                      })}
                      className="w-16"
                    />
                    <Input
                      value={visualConfig.secondary_color}
                      onChange={(e) => setVisualConfig({
                        ...visualConfig,
                        secondary_color: e.target.value
                      })}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family">Fuente</Label>
                <Select 
                  value={visualConfig.font_family} 
                  onValueChange={(value) => setVisualConfig({
                    ...visualConfig,
                    font_family: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Moderna)</SelectItem>
                    <SelectItem value="Arial">Arial (Clásica)</SelectItem>
                    <SelectItem value="Georgia">Georgia (Elegante)</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman (Formal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {template ? 'Actualizar' : 'Crear'} Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};