
import React, { useState } from 'react';
import { Valoracion } from '@/types/Valoracion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Edit, Share } from 'lucide-react';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { ValoracionDocumentsList } from './ValoracionDocumentsList';
import { ValoracionActivityPanel } from './ValoracionActivityPanel';
import { ValoracionHistoryModal } from './ValoracionHistoryModal';
import { GeneratePDFButton } from './GeneratePDFButton';
import { ValoracionSummaryTab } from './tabs/ValoracionSummaryTab';
import { ValoracionMethodsTab } from './tabs/ValoracionMethodsTab';
import { ValoracionInputsTab } from './tabs/ValoracionInputsTab';
import { ValoracionReviewTab } from './tabs/ValoracionReviewTab';
import { ValoracionTasksTab } from './tabs/ValoracionTasksTab';
import { LazyTabContent } from '@/components/ui/LazyTabContent';

interface ValoracionDetailPanelProps {
  valoracion: Valoracion;
  onClose: () => void;
  onEdit: (valoracion: Valoracion) => void;
  onGenerateClientLink?: (valoracion: Valoracion) => void;
  className?: string;
}

export const ValoracionDetailPanel: React.FC<ValoracionDetailPanelProps> = ({
  valoracion,
  onClose,
  onEdit,
  onGenerateClientLink,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [showHistory, setShowHistory] = useState(false);
  
  const phase = VALORACION_PHASES[valoracion.status];

  return (
    <div className={`h-full flex flex-col bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{phase.icon}</div>
          <div>
            <h2 className="text-xl font-semibold">{valoracion.company_name}</h2>
            <p className="text-muted-foreground">Cliente: {valoracion.client_name}</p>
          </div>
          <Badge className={phase.bgColor + ' ' + phase.textColor}>
            {phase.label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <GeneratePDFButton valoracion={valoracion} />
          
          <Button variant="outline" size="sm" onClick={() => onEdit(valoracion)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          {onGenerateClientLink && valoracion.status === 'delivered' && (
            <Button variant="outline" size="sm" onClick={() => onGenerateClientLink(valoracion)}>
              <Share className="h-4 w-4 mr-2" />
              Enlace Cliente
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="metodos">Métodos</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="revision">Revisión</TabsTrigger>
            <TabsTrigger value="actividad">Actividad</TabsTrigger>
            <TabsTrigger value="tareas">Tareas</TabsTrigger>
          </TabsList>

          {/* Resumen Tab */}
          <TabsContent value="resumen">
            <LazyTabContent isActive={activeTab === 'resumen'}>
              <ValoracionSummaryTab valoracion={valoracion} />
            </LazyTabContent>
          </TabsContent>

          {/* Métodos Tab */}
          <TabsContent value="metodos">
            <LazyTabContent isActive={activeTab === 'metodos'}>
              <ValoracionMethodsTab valoracion={valoracion} />
            </LazyTabContent>
          </TabsContent>

          {/* Inputs Tab */}
          <TabsContent value="inputs">
            <LazyTabContent isActive={activeTab === 'inputs'}>
              <ValoracionInputsTab valoracion={valoracion} />
            </LazyTabContent>
          </TabsContent>

          {/* Documentos Tab */}
          <TabsContent value="documentos">
            <LazyTabContent isActive={activeTab === 'documentos'}>
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>
                    Gestiona los documentos asociados a esta valoración (Excel/Word/PDF)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ValoracionDocumentsList
                    valoracion={valoracion}
                    onRefresh={() => {
                      // Trigger refresh if needed
                    }}
                  />
                </CardContent>
              </Card>
            </LazyTabContent>
          </TabsContent>

          {/* Revisión Tab */}
          <TabsContent value="revision">
            <LazyTabContent isActive={activeTab === 'revision'}>
              <ValoracionReviewTab valoracion={valoracion} />
            </LazyTabContent>
          </TabsContent>

          {/* Actividad Tab */}
          <TabsContent value="actividad">
            <LazyTabContent isActive={activeTab === 'actividad'}>
              <ValoracionActivityPanel valoracionId={valoracion.id} />
            </LazyTabContent>
          </TabsContent>

          {/* Tareas Tab */}
          <TabsContent value="tareas">
            <LazyTabContent isActive={activeTab === 'tareas'}>
              <ValoracionTasksTab valoracion={valoracion} />
            </LazyTabContent>
          </TabsContent>
        </Tabs>
      </div>

      {/* History Modal */}
      <ValoracionHistoryModal
        valoracion={valoracion}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
};
