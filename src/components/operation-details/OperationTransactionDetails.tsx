
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Operation } from "@/types/Operation";

interface OperationTransactionDetailsProps {
  operation: Operation;
}

export const OperationTransactionDetails = ({ operation }: OperationTransactionDetailsProps) => {
  if (!operation.buyer && !operation.seller) {
    return null;
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Detalles de la Transacción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {operation.buyer && (
            <div>
              <label className="text-sm font-medium text-gray-600">Comprador</label>
              <p className="text-sm">{operation.buyer}</p>
            </div>
          )}
          {operation.seller && (
            <div>
              <label className="text-sm font-medium text-gray-600">Vendedor</label>
              <p className="text-sm">{operation.seller}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
