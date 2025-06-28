
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Building2, 
  Users, 
  DollarSign,
  Target,
  Handshake,
  PieChart,
  BarChart3
} from "lucide-react";

interface MAMetrics {
  totalDeals: number;
  activeMandates: number;
  pipelineValue: number;
  avgDealSize: number;
  closedDeals: number;
  winRate: number;
  sectorBreakdown: Array<{
    sector: string;
    count: number;
    value: number;
  }>;
  dealStages: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
}

interface MADashboardProps {
  metrics?: MAMetrics;
}

export const MADashboard = ({ metrics }: MADashboardProps) => {
  // Default metrics for M&A dashboard
  const defaultMetrics: MAMetrics = {
    totalDeals: 47,
    activeMandates: 12,
    pipelineValue: 125000000,
    avgDealSize: 15600000,
    closedDeals: 8,
    winRate: 67,
    sectorBreakdown: [
      { sector: "Technology", count: 15, value: 45000000 },
      { sector: "Healthcare", count: 12, value: 38000000 },
      { sector: "Financial Services", count: 8, value: 25000000 },
      { sector: "Manufacturing", count: 7, value: 12000000 },
      { sector: "Energy", count: 5, value: 5000000 }
    ],
    dealStages: [
      { stage: "Sourcing", count: 18, percentage: 38 },
      { stage: "Initial Review", count: 12, percentage: 26 },
      { stage: "Due Diligence", count: 8, percentage: 17 },
      { stage: "Negotiation", count: 6, percentage: 13 },
      { stage: "Closing", count: 3, percentage: 6 }
    ]
  };

  const data = metrics || defaultMetrics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.totalDeals)}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs último trimestre
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mandatos Activos</CardTitle>
            <Handshake className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.activeMandates)}</div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <Building2 className="h-3 w-3 mr-1" />
              En desarrollo activo
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Pipeline</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.pipelineValue)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Promedio: {formatCurrency(data.avgDealSize)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasa de Éxito</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.winRate}%</div>
            <Progress value={data.winRate} className="mt-2 h-2" />
            <p className="text-xs text-gray-600 mt-1">
              {data.closedDeals} deals cerrados este año
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.sectorBreakdown.map((sector, index) => (
                <div key={sector.sector} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{sector.sector}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{sector.count} deals</div>
                    <div className="text-xs text-gray-600">{formatCurrency(sector.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deal Pipeline Stages */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pipeline por Etapa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.dealStages.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stage.count}
                      </Badge>
                      <span className="text-xs text-gray-600">{stage.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Acciones Rápidas M&A</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Nuevo Target</div>
                  <div className="text-sm text-gray-600">Identificar nueva oportunidad</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Due Diligence</div>
                  <div className="text-sm text-gray-600">Iniciar proceso DD</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Handshake className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Pitch Deck</div>
                  <div className="text-sm text-gray-600">Preparar presentación</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
