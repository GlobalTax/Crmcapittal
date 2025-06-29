
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmailTracking } from "@/hooks/useEmailTracking";
import { Mail, MailOpen, TrendingUp } from "lucide-react";

export const EmailStatsCard = () => {
  const { emailStats, statsLoading } = useEmailTracking();

  if (statsLoading || !emailStats) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Email Stats</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{emailStats.totalSent}</div>
          <p className="text-xs text-muted-foreground">Total de emails enviados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emails Abiertos</CardTitle>
          <MailOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{emailStats.totalOpened}</div>
          <p className="text-xs text-muted-foreground">Confirmados como abiertos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Apertura</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{emailStats.openRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Porcentaje de apertura</p>
        </CardContent>
      </Card>
    </div>
  );
};
