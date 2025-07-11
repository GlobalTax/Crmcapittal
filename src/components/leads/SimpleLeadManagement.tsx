import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleLeadsTable } from "./SimpleLeadsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOptimizedLeads } from "@/hooks/useOptimizedLeads";
import { Users, TrendingUp, UserCheck, AlertCircle } from "lucide-react";

export const SimpleLeadManagement = () => {
  const [activeTab, setActiveTab] = useState("manage");
  const { leads, isLoading } = useOptimizedLeads();

  // Calculate stats
  const stats = {
    total: leads.length,
    new: leads.filter(lead => lead.status === 'NEW').length,
    contacted: leads.filter(lead => lead.status === 'CONTACTED').length,
    qualified: leads.filter(lead => lead.status === 'QUALIFIED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Leads</h1>
        <p className="text-muted-foreground">
          Gestiona y realiza seguimiento de tus leads comerciales
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Gestionar</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <SimpleLeadsTable />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Todos los leads registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.new}</div>
                <p className="text-xs text-muted-foreground">
                  Leads sin contactar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contactados</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.contacted}</div>
                <p className="text-xs text-muted-foreground">
                  Leads en proceso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calificados</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.qualified}</div>
                <p className="text-xs text-muted-foreground">
                  Leads calificados
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <p>Próximamente: gráficos y métricas detalladas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};