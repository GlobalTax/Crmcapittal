
import { Card, CardContent } from "@/components/ui/card";
import { Euro, TrendingUp, Target, Calendar, Activity, Clock } from "lucide-react";
import { Negocio } from "@/types/Negocio";

interface NegociosStatsProps {
  negocios: Negocio[];
}

export const NegociosStats = ({ negocios }: NegociosStatsProps) => {
  const totalValue = negocios.reduce((sum, negocio) => sum + (negocio.valor_negocio || 0), 0);
  const activeNegocios = negocios.filter(negocio => negocio.is_active).length;
  const avgNegocioValue = activeNegocios > 0 ? totalValue / activeNegocios : 0;
  
  // Calcular valor ponderado basado en la etapa
  const weightedValue = negocios.reduce((sum, negocio) => {
    if (!negocio.valor_negocio || !negocio.stage) return sum;
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
    const weight = stageWeights[negocio.stage.name] || 0.5;
    return sum + (negocio.valor_negocio * weight);
  }, 0);

  // Calcular días promedio en pipeline
  const avgDaysInPipeline = negocios.length > 0 ? 
    negocios.reduce((sum, negocio) => {
      const daysSinceCreated = Math.floor((new Date().getTime() - new Date(negocio.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysSinceCreated;
    }, 0) / negocios.length : 0;

  const priorityStats = {
    urgente: negocios.filter(n => n.prioridad === 'urgente').length,
    alta: negocios.filter(n => n.prioridad === 'alta').length,
    media: negocios.filter(n => n.prioridad === 'media').length,
    baja: negocios.filter(n => n.prioridad === 'baja').length,
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
      value: activeNegocios.toString(),
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
      value: formatCurrency(avgNegocioValue),
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
