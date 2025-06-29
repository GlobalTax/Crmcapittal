
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmailTracking } from "@/hooks/useEmailTracking";
import { Mail, MailOpen, TrendingUp, Send } from "lucide-react";

export const EmailStatsCard = () => {
  const { emailStats, statsLoading } = useEmailTracking();

  if (statsLoading || !emailStats) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Emails Enviados",
      value: emailStats.totalSent,
      description: "Total de emails enviados",
      icon: Send,
      color: "bg-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Emails Abiertos",
      value: emailStats.totalOpened,
      description: "Confirmados como abiertos",
      icon: MailOpen,
      color: "bg-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Tasa de Apertura",
      value: `${emailStats.openRate.toFixed(1)}%`,
      description: "Porcentaje de apertura",
      icon: TrendingUp,
      color: "bg-purple-500",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-lg border-0 overflow-hidden">
          <div className={`h-1 ${card.color}`}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">
              {card.title}
            </CardTitle>
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
            <p className="text-sm text-gray-500">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
