
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Operation } from "@/types/Operation";

interface OperationFinancialInfoProps {
  operation: Operation;
  formatAmount: (amount: number, currency: string) => string;
}

export const OperationFinancialInfo = ({ operation, formatAmount }: OperationFinancialInfoProps) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Información Financiera
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {operation.revenue && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(operation.revenue, operation.currency)}
              </p>
              <p className="text-sm text-gray-600">Facturación</p>
            </div>
          )}
          
          {operation.ebitda && (
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-2xl font-bold text-purple-600">
                {formatAmount(operation.ebitda, operation.currency)}
              </p>
              <p className="text-sm text-gray-600">EBITDA</p>
            </div>
          )}
        </div>

        {operation.annual_growth_rate && (
          <div className="mt-4 text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-xl font-bold text-yellow-600">
              {operation.annual_growth_rate}%
            </p>
            <p className="text-sm text-gray-600">Crecimiento Anual</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
