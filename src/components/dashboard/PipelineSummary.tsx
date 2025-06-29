
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineSummaryProps {
  deals: any[];
  availableOperations: any[];
  inProcessOperations: any[];
  soldOperations: any[];
  totalOperations: number;
}

export const PipelineSummary = ({ 
  deals, 
  availableOperations, 
  inProcessOperations, 
  soldOperations, 
  totalOperations 
}: PipelineSummaryProps) => {
  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Pipeline M&A
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Lead Valoración</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {deals.filter(d => d.stage === 'lead_valoracion').length + availableOperations.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">En Proceso</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {deals.filter(d => d.stage === 'en_contacto').length + inProcessOperations.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Cerradas</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {soldOperations.length}
            </span>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total Deals</span>
              <span className="text-sm font-bold text-gray-900">
                {deals.length + totalOperations}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
