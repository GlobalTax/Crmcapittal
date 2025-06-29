
import { TargetCompany, TargetStatus } from "@/types/TargetCompany";
import { Deal } from "@/types/Deal";
import { Stage } from "@/types/Pipeline";
import { PipelineType } from "@/types/Pipeline";

export const groupItemsByStage = (
  stages: Stage[],
  pipelineType: PipelineType,
  deals: Deal[],
  targetCompanies: TargetCompany[]
): Record<string, (Deal | TargetCompany)[]> => {
  return stages.reduce((acc, stage) => {
    if (pipelineType === 'DEAL') {
      acc[stage.id] = deals.filter(deal => deal.stage_id === stage.id);
    } else if (pipelineType === 'TARGET_COMPANY') {
      // For target companies, we still use the old status-based grouping
      const statusColumns: { id: TargetStatus; stageId?: string }[] = [
        { id: 'IDENTIFIED' },
        { id: 'RESEARCHING' },
        { id: 'OUTREACH_PLANNED' },
        { id: 'CONTACTED' },
        { id: 'IN_CONVERSATION' },
        { id: 'ON_HOLD' },
        { id: 'CONVERTED_TO_DEAL' }
      ];
      
      const matchingStatus = statusColumns.find((_, index) => index === stage.order_index - 1);
      if (matchingStatus) {
        acc[stage.id] = targetCompanies.filter(company => company.status === matchingStatus.id);
      }
    }
    return acc;
  }, {} as Record<string, (Deal | TargetCompany)[]>);
};
