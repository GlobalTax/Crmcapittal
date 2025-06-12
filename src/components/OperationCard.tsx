
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
    <Card className="hover:shadow-lg transition-all duration-200 border-black bg-white">
      <CardHeader className="pb-3">
        <OperationCardHeader operation={operation} />
      </CardHeader>
      
      <CardContent className="space-y-3">
        <OperationCardContent operation={operation} />
        <OperationCardActions operation={operation} />
      </CardContent>
    </Card>
  );
};
