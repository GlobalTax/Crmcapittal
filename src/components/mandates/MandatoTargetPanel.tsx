import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MandateTarget } from '@/types/BuyingMandate';
import { TargetDataTable } from './TargetDataTable';
import { TargetFiltersPanel } from './TargetFiltersPanel';
import { MandateTargetsPipeline } from './MandateTargetsPipeline';

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

  useEffect(() => {
    setFilteredTargets(targets);
  }, [targets]);

  const handleFilterTargets = (filtered: MandateTarget[]) => {
    setFilteredTargets(filtered);
  };

  return (
    <div className="space-y-6">
      {/* Filters and View Toggle */}
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
        </div>
      </div>

      {/* Content based on view mode */}
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
    </div>
  );
};