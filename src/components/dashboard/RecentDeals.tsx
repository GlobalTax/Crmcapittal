
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface Deal {
  id: string;
  dealName: string;
  companyName?: string;
  dealType: string;
  dealValue?: number;
}

interface RecentDealsProps {
  deals: Deal[];
}

export const RecentDeals = ({ deals }: RecentDealsProps) => {
  if (deals.length === 0) return null;

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Target className="h-4 w-4 mr-2 text-orange-600" />
          Deals Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {deals.slice(0, 3).map(deal => (
            <div key={deal.id} className="border-l-4 border-orange-500 pl-3">
              <p className="text-sm font-medium text-gray-900">{deal.dealName}</p>
              <p className="text-xs text-gray-500">{deal.companyName}</p>
              <div className="flex items-center justify-between mt-1">
                <Badge className="text-xs bg-orange-100 text-orange-800">
                  {deal.dealType}
                </Badge>
                <span className="text-xs font-medium text-gray-900">
                  €{deal.dealValue ? Number(deal.dealValue).toLocaleString() : '0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
