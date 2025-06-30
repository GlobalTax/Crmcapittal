
import { Card, CardContent } from "@/components/ui/card";
import { Euro, TrendingUp, Users, Clock, Target, Calendar, Activity } from "lucide-react";
import { Deal } from "@/types/Deal";

interface DealsStatsProps {
  deals: Deal[];
}

export const DealsStats = ({ deals }: DealsStatsProps) => {
  const totalValue = deals.reduce((sum, deal) => sum + (deal.deal_value || 0), 0);
  const activeDeals = deals.filter(deal => deal.is_active).length;
  const avgDealValue = activeDeals > 0 ? totalValue / activeDeals : 0;
  
  // Calcular valor ponderado (weighted value) basado en la etapa
  const weightedValue = deals.reduce((sum, deal) => {
    if (!deal.deal_value || !deal.stage) return sum;
    // Asignar probabilidad basada en la etapa (esto se puede personalizar)
    const stageWeights: { [key: string]: number } = {
      'Lead Valoración': 0.1,
      'Lead Importante': 0.2,
      'Enviado 1r Contacto': 0.3,
      'En Contacto': 0.4,
      'PSI Enviada': 0.5,
      'Solicitando Info': 0.6,
      'Realizando Valoración': 0.7,
      'Valoración Entregada': 0.8,
      'Lead CV': 0.9
    };
    const weight = stageWeights[deal.stage.name] || 0.5;
    return sum + (deal.deal_value * weight);
  }, 0);

  // Calcular días promedio en pipeline
  const avgDaysInPipeline = deals.length > 0 ? 
    deals.reduce((sum, deal) => {
      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysSinceCreated;
    }, 0) / deals.length : 0;

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
      title: "Negocios Abiertos",
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
      title: "Valor Ponderado",
      value: formatCurrency(weightedValue),
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Valor Promedio",
      value: formatCurrency(avgDealValue),
      icon: Activity,
      color: "text-orange-600"
    },
    {
      title: "Días Promedio",
      value: Math.round(avgDaysInPipeline).toString(),
      icon: Calendar,
      color: "text-cyan-600"
    },
    {
      title: "Alta Prioridad",
      value: (priorityStats.urgente + priorityStats.alta).toString(),
      icon: Clock,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
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
