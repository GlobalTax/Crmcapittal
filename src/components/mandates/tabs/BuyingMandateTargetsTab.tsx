import { MandatoTargetPanel } from '../MandatoTargetPanel';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';

interface BuyingMandateTargetsTabProps {
  mandate: BuyingMandate;
  targets: MandateTarget[];
  onTargetUpdate: () => void;
}

export const BuyingMandateTargetsTab = ({
  mandate,
  targets,
  onTargetUpdate
}: BuyingMandateTargetsTabProps) => {
  const handleEditTarget = (target: MandateTarget) => {
    // TODO: Implement edit target functionality
    console.log('Edit target:', target);
  };

  const handleViewDocuments = (target: MandateTarget) => {
    // TODO: Implement view documents functionality
    console.log('View documents for target:', target);
  };

  return (
    <MandatoTargetPanel
      targets={targets}
      documents={[]} // Documents will be passed separately when needed
      onEditTarget={handleEditTarget}
      onViewDocuments={handleViewDocuments}
    />
  );
};