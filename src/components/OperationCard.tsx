
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Operation } from "@/types/Operation";
import { OperationCardHeader } from "./OperationCardHeader";
import { OperationCardContent } from "./OperationCardContent";
import { OperationCardActions } from "./OperationCardActions";

interface OperationCardProps {
  operation: Operation;
}

export const OperationCard = ({ operation }: OperationCardProps) => {
  return (
    <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <OperationCardHeader operation={operation} />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <OperationCardContent operation={operation} />
        <OperationCardActions operation={operation} />
      </CardContent>
    </Card>
  );
};
