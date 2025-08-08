import React, { useCallback, useMemo } from 'react';
import ReactQuill from '@/components/common/LazyQuill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Save, Eye, Variable, Image, Table, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  showToolbar?: boolean;
  variables?: Array<{ key: string; label: string; example: string; category: string }>;
  onSave?: () => void;
  onPreview?: () => void;
}

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe el contenido de tu propuesta...",
  readOnly = false,
  minHeight = 300,
  showToolbar = true,
  variables = [],
  onSave,
  onPreview
}) => {
  // Configuración avanzada del editor
  const modules = useMemo(() => ({
    toolbar: showToolbar ? {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['clean']
      ]
    } : false,
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  }), [showToolbar]);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'script',
    'code-block'
  ];

  const insertVariable = useCallback((variable: { key: string; label: string }) => {
    const quill = (document.querySelector('.ql-editor') as any)?.__quill;
    if (quill) {
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      quill.insertText(index, `{{${variable.key}}}`, 'bold', true);
      quill.setSelection(index + variable.key.length + 4);
    }
  }, []);

  const insertTable = useCallback(() => {
    const quill = (document.querySelector('.ql-editor') as any)?.__quill;
    if (quill) {
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      const tableHTML = `
        <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Encabezado 1</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">Encabezado 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Celda 1</td>
              <td style="border: 1px solid #ddd; padding: 8px;">Celda 2</td>
            </tr>
          </tbody>
        </table>
      `;
      quill.clipboard.dangerouslyPasteHTML(index, tableHTML);
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="h-5 w-5" />
            <span>Editor de Contenido</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {onPreview && (
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
            )}
            {onSave && (
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toolbar de acciones rápidas */}
        {showToolbar && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
              className="text-xs"
            >
              <Table className="h-3 w-3 mr-1" />
              Tabla
            </Button>
            
            {variables.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Variables:</span>
                {variables.slice(0, 3).map((variable) => (
                  <Button
                    key={variable.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertVariable(variable)}
                    className="text-xs"
                    title={variable.label}
                  >
                    <Variable className="h-3 w-3 mr-1" />
                    {variable.label}
                  </Button>
                ))}
                {variables.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{variables.length - 3} más
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Editor principal */}
        <div className={cn(
          "border rounded-lg overflow-hidden",
          readOnly && "bg-muted/30"
        )}>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
            style={{
              minHeight: `${minHeight}px`,
            }}
            className={cn(
              "[&_.ql-editor]:min-h-[300px] [&_.ql-editor]:p-4",
              "[&_.ql-toolbar]:border-b [&_.ql-toolbar]:bg-background",
              "[&_.ql-container]:border-0",
              readOnly && "[&_.ql-toolbar]:hidden"
            )}
          />
        </div>

        {/* Información de variables disponibles */}
        {variables.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <Variable className="h-3 w-3" />
              <span className="font-medium">Variables disponibles:</span>
            </div>
            <div className="space-y-1">
              {variables.map((variable) => (
                <div key={variable.key} className="flex items-center space-x-2">
                  <code className="bg-background px-1 rounded text-xs">
                    {`{{${variable.key}}}`}
                  </code>
                  <span>- {variable.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};