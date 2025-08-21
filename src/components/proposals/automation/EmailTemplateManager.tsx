import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Mail, Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useAutomationSystem';
import { SecureHtmlRenderer } from '@/components/security/SecureHtmlRenderer';

export const EmailTemplateManager: React.FC = () => {
  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating,
    isUpdating,
    isDeleting
  } = useEmailTemplates();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    template_type: 'custom' as EmailTemplate['template_type'],
    variables: [] as string[],
    is_active: true
  });

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        content: template.content,
        template_type: template.template_type,
        variables: template.variables || [],
        is_active: template.is_active
      });
    } else {
      setSelectedTemplate(null);
      setFormData({
        name: '',
        subject: '',
        content: '',
        template_type: 'custom',
        variables: [],
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTemplate) {
      updateTemplate({
        id: selectedTemplate.id,
        updates: formData
      });
    } else {
      createTemplate(formData);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (template: EmailTemplate) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      deleteTemplate(template.id);
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copia)`,
      subject: template.subject,
      content: template.content,
      template_type: template.template_type,
      variables: template.variables || [],
      is_active: true
    });
    setSelectedTemplate(null);
    setIsDialogOpen(true);
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(match => match.slice(2, -2).trim()))];
  };

  const handleContentChange = (content: string) => {
    const variables = extractVariables(`${formData.subject} ${content}`);
    setFormData(prev => ({ ...prev, content, variables }));
  };

  const handleSubjectChange = (subject: string) => {
    const variables = extractVariables(`${subject} ${formData.content}`);
    setFormData(prev => ({ ...prev, subject, variables }));
  };

  const getTypeColor = (type: EmailTemplate['template_type']) => {
    const colors = {
      proposal_send: 'bg-primary',
      follow_up: 'bg-orange-500',
      reminder: 'bg-yellow-500',
      thank_you: 'bg-green-500',
      custom: 'bg-gray-500'
    };
    return colors[type];
  };

  const getTypeLabel = (type: EmailTemplate['template_type']) => {
    const labels = {
      proposal_send: 'Envío Propuesta',
      follow_up: 'Seguimiento',
      reminder: 'Recordatorio',
      thank_you: 'Agradecimiento',
      custom: 'Personalizada'
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Plantillas de Email</h2>
          <p className="text-muted-foreground">
            Gestiona las plantillas de email para comunicaciones automáticas
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${getTypeColor(template.template_type)} text-white`}
                  >
                    {getTypeLabel(template.template_type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={template.is_active}
                    onCheckedChange={(checked) => 
                      updateTemplate({
                        id: template.id,
                        updates: { is_active: checked }
                      })
                    }
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Asunto:</p>
                <p className="text-sm font-medium truncate">{template.subject}</p>
              </div>

              {template.variables && template.variables.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(template)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para crear/editar plantilla */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate 
                ? 'Modifica los datos de la plantilla de email'
                : 'Crea una nueva plantilla de email para comunicaciones automáticas'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Seguimiento Primera Semana"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.template_type}
                  onValueChange={(value: EmailTemplate['template_type']) =>
                    setFormData(prev => ({ ...prev, template_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal_send">Envío Propuesta</SelectItem>
                    <SelectItem value="follow_up">Seguimiento</SelectItem>
                    <SelectItem value="reminder">Recordatorio</SelectItem>
                    <SelectItem value="thank_you">Agradecimiento</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="Ej: Seguimiento - Propuesta {{company_name}}"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Contenido del email (usa {{variable}} para variables dinámicas)"
                rows={8}
                required
              />
            </div>

            {formData.variables.length > 0 && (
              <div className="space-y-2">
                <Label>Variables detectadas</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="is_active">Plantilla activa</Label>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {selectedTemplate ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de preview */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Vista Previa: {previewTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Asunto:</Label>
                <p className="mt-1 text-sm border rounded p-2 bg-muted">
                  {previewTemplate.subject}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Contenido:</Label>
                <SecureHtmlRenderer 
                  content={previewTemplate.content}
                  className="mt-1 text-sm border rounded p-4 bg-background"
                  allowBasicFormatting={true}
                  maxLength={10000}
                />
              </div>

              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Variables disponibles:</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {previewTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="outline">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};