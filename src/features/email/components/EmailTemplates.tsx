import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { useEmailTemplates, useCreateEmailTemplate, useUpdateEmailTemplate, useDeleteEmailTemplate } from '../hooks/useEmailTemplates';
import { EmailTemplate } from '../types';
import { SecureHtmlRenderer } from '@/components/security/SecureHtmlRenderer';

export const EmailTemplates: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  
  const { data: templates = [], isLoading } = useEmailTemplates();
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();

  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    body_html: string;
    body_text: string;
    category: string;
    language: string;
    variables: string[];
    is_shared: boolean;
  }>({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
    category: 'general',
    language: 'es',
    variables: [],
    is_shared: false
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTemplate.mutateAsync(formData);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    
    try {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        updates: formData
      });
      setEditingTemplate(null);
      resetForm();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este template?')) {
      try {
        await deleteTemplate.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      body_text: '',
      category: 'general',
      language: 'es',
      variables: [],
      is_shared: false
    });
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || '',
      category: template.category,
      language: template.language,
      variables: template.variables,
      is_shared: template.is_shared
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-secondary',
      follow_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      proposal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      closing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      welcome: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (isLoading) {
    return (
      <Card className="h-full p-6">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Cargando templates...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Templates de Email</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="follow_up">Seguimiento</SelectItem>
                      <SelectItem value="proposal">Propuesta</SelectItem>
                      <SelectItem value="closing">Cierre</SelectItem>
                      <SelectItem value="welcome">Bienvenida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="body_html">Contenido HTML</Label>
                <Textarea
                  id="body_html"
                  value={formData.body_html}
                  onChange={(e) => setFormData({...formData, body_html: e.target.value})}
                  rows={8}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTemplate.isPending}>
                  {createTemplate.isPending ? 'Creando...' : 'Crear Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  {template.is_shared && (
                    <Badge variant="outline">Compartido</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{template.subject}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Usado {template.usage_count} veces</span>
                  {template.last_used_at && (
                    <span>Último uso: {new Date(template.last_used_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTemplate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="follow_up">Seguimiento</SelectItem>
                    <SelectItem value="proposal">Propuesta</SelectItem>
                    <SelectItem value="closing">Cierre</SelectItem>
                    <SelectItem value="welcome">Bienvenida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-subject">Asunto</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-body">Contenido HTML</Label>
              <Textarea
                id="edit-body"
                value={formData.body_html}
                onChange={(e) => setFormData({...formData, body_html: e.target.value})}
                rows={8}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingTemplate(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateTemplate.isPending}>
                {updateTemplate.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista Previa: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Asunto:</Label>
                <p className="text-sm bg-muted p-2 rounded">{previewTemplate.subject}</p>
              </div>
              <div>
                <Label>Contenido:</Label>
                <SecureHtmlRenderer 
                  content={previewTemplate.body_html}
                  className="border p-4 rounded bg-background max-h-96 overflow-y-auto"
                  allowBasicFormatting={true}
                />
              </div>
              {previewTemplate.variables.length > 0 && (
                <div>
                  <Label>Variables disponibles:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="outline">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};