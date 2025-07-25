import React from 'react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { MandateTargetPipeline } from '@/components/mandates/MandateTargetPipeline';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';

interface MandatePipelineTabProps {
  mandate: BuyingMandate;
}

export const MandatePipelineTab = ({ mandate }: MandatePipelineTabProps) => {
  const { targets, documents } = useBuyingMandates();

  const handleTargetClick = (target: any) => {
    // Handle target click logic here
    console.log('Target clicked:', target.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Pipeline de Objetivos</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona el estado de las empresas objetivo mediante drag & drop
        </p>
      </div>
      
      <MandateTargetPipeline
        targets={targets}
        documents={documents}
        onTargetClick={handleTargetClick}
      />
    </div>
  );
};