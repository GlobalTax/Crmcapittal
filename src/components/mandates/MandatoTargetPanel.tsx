
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { TargetDataTable } from './TargetDataTable';
import { TargetFiltersPanel } from './TargetFiltersPanel';
import { MandateTargetsPipeline } from './MandateTargetsPipeline';
import { ImportFromCRMDialog } from './ImportFromCRMDialog';
import { MandateTargetsDialog } from './MandateTargetsDialog';
import { EmptyState } from '@/components/ui/EmptyState';

interface MandatoTargetPanelProps {
  targets: MandateTarget[];
  documents: any[];
  onEditTarget: (target: MandateTarget) => void;
  onViewDocuments: (target: MandateTarget) => void;
}

export const MandatoTargetPanel = ({
  targets,
  documents,
  onEditTarget,
  onViewDocuments,
}: MandatoTargetPanelProps) => {
  const [filteredTargets, setFilteredTargets] = useState<MandateTarget[]>(targets);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [showTargetsDialog, setShowTargetsDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    setFilteredTargets(targets);
  }, [targets]);

  const handleFilterTargets = (filtered: MandateTarget[]) => {
    setFilteredTargets(filtered);
  };

  // Si no hay targets, mostrar estado vacío
  if (targets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Plus}
            title="No hay targets identificados"
            description="Los targets son las empresas objetivo para este mandato de M&A. Puedes añadirlos manualmente o importarlos desde el CRM."
            action={
              <div className="flex gap-2">
                <Button onClick={() => setShowTargetsDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Target Manual
                </Button>
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar desde CRM
                </Button>
              </div>
            }
          />
          
          {/* Dialogs */}
          <MandateTargetsDialog
            mandate={{ id: targets[0]?.mandate_id } as any}
            open={showTargetsDialog}
            onOpenChange={setShowTargetsDialog}
          />
          
          <ImportFromCRMDialog
            mandateId={targets[0]?.mandate_id || ''}
            onImported={() => {}}
            trigger={<></>}
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <TargetFiltersPanel 
            targets={targets}
            onFilter={handleFilterTargets}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'table' | 'pipeline')}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="table">Vista Tabla</option>
            <option value="pipeline">Vista Pipeline</option>
          </select>
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar CRM
          </Button>
          <Button onClick={() => setShowTargetsDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Target
          </Button>
        </div>
      </div>

      {/* Contenido basado en el modo de vista */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-6">
            <TargetDataTable
              targets={filteredTargets}
              documents={documents}
              onEditTarget={onEditTarget}
              onViewDocuments={onViewDocuments}
            />
          </CardContent>
        </Card>
      ) : (
        <MandateTargetsPipeline
          targets={filteredTargets}
          documents={documents}
          onTargetClick={onViewDocuments}
        />
      )}

      {/* Dialogs */}
      <MandateTargetsDialog
        mandate={{ id: targets[0]?.mandate_id } as any}
        open={showTargetsDialog}
        onOpenChange={setShowTargetsDialog}
      />
      
      <ImportFromCRMDialog
        mandateId={targets[0]?.mandate_id || ''}
        onImported={() => {}}
        trigger={<></>}
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
};
