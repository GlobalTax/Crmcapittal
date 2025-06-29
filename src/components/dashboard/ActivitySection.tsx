
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: 'operation' | 'lead' | 'user';
  description: string;
  timestamp: Date;
  user: string;
  priority?: 'low' | 'medium' | 'high';
}

interface Deal {
  id: string;
  dealName: string;
  dealValue?: number;
  dealOwner?: string;
  companyName?: string;
}

interface ActivitySectionProps {
  deals: Deal[];
  activities: ActivityItem[];
}

export const ActivitySection = ({ deals, activities }: ActivitySectionProps) => {
  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Actividad Reciente
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
            Ver todo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Show recent deals if any */}
          {deals.slice(0, 2).map((deal) => (
            <div key={deal.id} className="flex items-start space-x-3 py-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Nuevo deal creado: {deal.dealName} - €{deal.dealValue ? Number(deal.dealValue).toLocaleString() : '0'}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{deal.dealOwner?.replace('_', ' ') || 'Sistema'}</span>
                  <span className="mx-2">•</span>
                  <span>hace unos momentos</span>
                </div>
              </div>
              <Badge className="text-xs bg-green-100 text-green-800">
                Nuevo
              </Badge>
            </div>
          ))}
          
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.description}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{activity.user}</span>
                  <span className="mx-2">•</span>
                  <span>hace {Math.floor((Date.now() - activity.timestamp.getTime()) / (1000 * 60))} min</span>
                </div>
              </div>
              <Badge className={`text-xs ${
                activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.priority === 'high' ? 'Alta' : 
                 activity.priority === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
