import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, Download, Save } from 'lucide-react';
import { CreateProposalData } from '@/types/Proposal';
import { AdvancedEditor } from '../editor/AdvancedEditor';
import { ContentPreview } from '../editor/ContentPreview';
import { TEMPLATE_VARIABLES } from '@/types/ProposalTemplate';

interface ContentStepProps {
  data: CreateProposalData;
  onChange: (data: Partial<CreateProposalData>) => void;
  errors: string[];
}

export const ContentStep: React.FC<ContentStepProps> = ({ data, onChange, errors }) => {
  const [activeTab, setActiveTab] = useState('editor');

  const handleSave = () => {
    // Lógica para guardar borrador
    console.log('Guardando borrador...');
  };

  const handleDownload = () => {
    // Lógica para generar PDF
    console.log('Generando PDF...');
  };

  const handleShare = () => {
    // Lógica para compartir propuesta
    console.log('Compartiendo propuesta...');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Contenido de la Propuesta</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Vista Previa</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-6">
            <AdvancedEditor
              value={data.description || ''}
              onChange={(value) => onChange({ description: value })}
              placeholder="Escribe el contenido detallado de tu propuesta..."
              variables={TEMPLATE_VARIABLES}
              onSave={handleSave}
              onPreview={() => setActiveTab('preview')}
              minHeight={500}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <ContentPreview
              data={data}
              content={data.description || ''}
              onDownload={handleDownload}
              onShare={handleShare}
              onPrint={() => window.print()}
            />
          </TabsContent>
        </Tabs>

        {errors.length > 0 && (
          <div className="mt-4 bg-destructive/10 text-destructive p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};