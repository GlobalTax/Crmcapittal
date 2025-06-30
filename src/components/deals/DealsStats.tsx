
import { Card, CardContent } from "@/components/ui/card";
import { Euro, TrendingUp, Users, Clock, Target } from "lucide-react";
import { Deal } from "@/types/Deal";

interface DealsStatsProps {
  deals: Deal[];
}

export const DealsStats = ({ deals }: DealsStatsProps) => {
  const totalValue = deals.reduce((sum, deal) => sum + (deal.deal_value || 0), 0);
  const activeDeals = deals.filter(deal => deal.is_active).length;
  const avgDealValue = activeDeals > 0 ? totalValue / activeDeals : 0;

  const priorityStats = {
    urgente: deals.filter(d => d.priority === 'urgente').length,
    alta: deals.filter(d => d.priority === 'alta').length,
    media: deals.filter(d => d.priority === 'media').length,
    baja: deals.filter(d => d.priority === 'baja').length,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const stats = [
    {
      title: "Total Deals",
      value: activeDeals.toString(),
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Valor Total",
      value: formatCurrency(totalValue),
      icon: Euro,
      color: "text-green-600"
    },
    {
      title: "Valor Promedio",
      value: formatCurrency(avgDealValue),
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Alta Prioridad",
      value: (priorityStats.urgente + priorityStats.alta).toString(),
      icon: Clock,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
