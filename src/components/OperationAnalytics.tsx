
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, TrendingUp, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { useOperations } from "@/hooks/useOperations";

export const OperationAnalytics = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { operations } = useOperations();

  // Simulamos datos de analytics (en una implementación real vendrían de la base de datos)
  const analyticsData = operations.map(op => ({
    ...op,
    views: Math.floor(Math.random() * 500) + 50,
    downloads: Math.floor(Math.random() * 100) + 10,
    viewsThisWeek: Math.floor(Math.random() * 50) + 5,
    downloadsThisWeek: Math.floor(Math.random() * 20) + 2,
  }));

  const totalViews = analyticsData.reduce((sum, op) => sum + op.views, 0);
  const totalDownloads = analyticsData.reduce((sum, op) => sum + op.downloads, 0);
  const avgViewsPerOperation = Math.round(totalViews / analyticsData.length);
  const conversionRate = ((totalDownloads / totalViews) * 100).toFixed(1);

  const topOperationsByViews = analyticsData
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const topOperationsByDownloads = analyticsData
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);

  if (!isExpanded) {
    return (
      <div className="mb-6 sm:mb-8">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          className="w-full border-black text-black hover:bg-gray-100 py-4"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Ver Analytics de Operaciones
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 sm:mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black">Analytics de Operaciones</h2>
        <Button
          onClick={() => setIsExpanded(false)}
          variant="outline"
          size="sm"
          className="border-black text-black hover:bg-gray-100"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Total Visualizaciones</p>
                <p className="text-xl font-bold text-black">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Total Descargas</p>
                <p className="text-xl font-bold text-black">{totalDownloads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Promedio Vistas/Op</p>
                <p className="text-xl font-bold text-black">{avgViewsPerOperation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs font-medium text-gray-600">Tasa Conversión</p>
                <p className="text-xl font-bold text-black">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con rankings */}
      <Tabs defaultValue="views" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="views">Top por Visualizaciones</TabsTrigger>
          <TabsTrigger value="downloads">Top por Descargas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="views" className="space-y-2">
          <div className="grid gap-2">
            {topOperationsByViews.map((operation, index) => (
              <div key={operation.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-black text-sm">{operation.company_name}</p>
                    <p className="text-xs text-gray-600">{operation.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-semibold text-black">{operation.views.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">+{operation.viewsThisWeek} esta semana</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="downloads" className="space-y-2">
          <div className="grid gap-2">
            {topOperationsByDownloads.map((operation, index) => (
              <div key={operation.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-black text-sm">{operation.company_name}</p>
                    <p className="text-xs text-gray-600">{operation.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-semibold text-black">{operation.downloads.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">+{operation.downloadsThisWeek} esta semana</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
