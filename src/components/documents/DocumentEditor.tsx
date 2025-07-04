import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Download, ArrowLeft } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Document, DocumentTemplate } from '@/types/Document';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DocumentEditorProps {
  document?: Document;
  template?: DocumentTemplate;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ document, template }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createDocument, updateDocument, templates } = useDocuments();
  const { toast } = useToast();

  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(template || null);
  const [variables, setVariables] = useState<Record<string, any>>(document?.variables || {});
  const [documentType, setDocumentType] = useState(document?.document_type || 'general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content?.content || '');
      setVariables(document.variables || {});
      setDocumentType(document.document_type);
    } else if (template) {
      setSelectedTemplate(template);
      setContent(template.content?.content || '');
      setVariables(template.variables || {});
      setDocumentType(template.template_type);
    }
  }, [document, template]);

  const processContent = (rawContent: string) => {
    let processedContent = rawContent;
    
    // Replace variables in content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value || `[${key}]`);
    });
    
    return processedContent;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    const documentData = {
      title,
      content: { content },
      template_id: selectedTemplate?.id,
      document_type: documentType,
      variables,
      status: 'draft' as const,
    };

    let result;
    if (document) {
      result = await updateDocument(document.id, documentData);
    } else {
      result = await createDocument(documentData);
    }

    setSaving(false);

    if (result && !document) {
      navigate(`/documents/${result.id}`);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Create a temporary div with the processed content
      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = processContent(content);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      window.document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Remove temporary div
      window.document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${title || 'documento'}.pdf`);

      toast({
        title: "Éxito",
        description: "PDF exportado correctamente",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el PDF",
        variant: "destructive",
      });
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/documents')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {document ? 'Editar Documento' : 'Nuevo Documento'}
            </h1>
            <p className="text-gray-600">
              {document ? 'Modifica el contenido del documento' : 'Crea un nuevo documento usando plantillas'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título del documento"
                />
              </div>

              {!document && (
                <div>
                  <Label htmlFor="template">Plantilla</Label>
                  <Select
                    value={selectedTemplate?.id || ''}
                    onValueChange={(value) => {
                      const template = templates.find(t => t.id === value);
                      if (template) {
                        setSelectedTemplate(template);
                        setContent(template.content?.content || '');
                        setVariables(template.variables || {});
                        setDocumentType(template.template_type);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Editor</Label>
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  theme="snow"
                  style={{ height: '400px', marginBottom: '50px' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none border rounded-lg p-4 bg-white min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: processContent(content) }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo de Documento</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="memorando">Memorando</SelectItem>
                    <SelectItem value="informe">Informe</SelectItem>
                    <SelectItem value="propuesta">Propuesta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Variables */}
          {selectedTemplate && Object.keys(selectedTemplate.variables).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedTemplate.variables).map(([key, label]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{String(label)}</Label>
                    <Input
                      id={key}
                      value={variables[key] || ''}
                      onChange={(e) => setVariables(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      placeholder={`Introduce ${String(label).toLowerCase()}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};