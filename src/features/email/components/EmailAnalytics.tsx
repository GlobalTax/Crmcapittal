import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Mail, Send, Eye, MousePointer, Reply, TrendingUp, 
  TrendingDown, Calendar, Users, Clock, Target 
} from 'lucide-react';

export const EmailAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAccount, setSelectedAccount] = useState('all');

  // Mock data - en una implementación real, esto vendría de la API
  const kpiData = {
    total_sent: 245,
    total_opened: 178,
    total_clicked: 67,
    total_replied: 32,
    total_bounced: 8,
    open_rate: 72.7,
    click_rate: 27.3,
    reply_rate: 13.1,
    bounce_rate: 3.3
  };

  const timeSeriesData = [
    { date: '2024-01-01', sent: 35, opened: 25, clicked: 8, replied: 3 },
    { date: '2024-01-02', sent: 42, opened: 31, clicked: 12, replied: 5 },
    { date: '2024-01-03', sent: 28, opened: 20, clicked: 6, replied: 2 },
    { date: '2024-01-04', sent: 39, opened: 28, clicked: 11, replied: 4 },
    { date: '2024-01-05', sent: 45, opened: 33, clicked: 14, replied: 7 },
    { date: '2024-01-06', sent: 31, opened: 22, clicked: 9, replied: 3 },
    { date: '2024-01-07', sent: 25, opened: 19, clicked: 7, replied: 8 }
  ];

  const templatePerformance = [
    { name: 'Propuesta Inicial', sent: 45, opened: 38, clicked: 15, open_rate: 84.4 },
    { name: 'Seguimiento 1', sent: 67, opened: 48, clicked: 18, open_rate: 71.6 },
    { name: 'Seguimiento 2', sent: 34, opened: 22, clicked: 8, open_rate: 64.7 },
    { name: 'Cierre', sent: 23, opened: 19, clicked: 12, open_rate: 82.6 },
    { name: 'Bienvenida', sent: 76, opened: 51, clicked: 14, open_rate: 67.1 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#8884d8' },
    { name: 'Mobile', value: 35, color: '#82ca9d' },
    { name: 'Tablet', value: 20, color: '#ffc658' }
  ];

  const topCampaigns = [
    { name: 'Campaña Q1 2024', sent: 1250, opened: 923, open_rate: 73.8, status: 'completed' },
    { name: 'Follow-up Automatizado', sent: 890, opened: 645, open_rate: 72.5, status: 'active' },
    { name: 'Propuestas Enero', sent: 456, opened: 312, open_rate: 68.4, status: 'completed' },
    { name: 'Onboarding Clientes', sent: 234, opened: 189, open_rate: 80.8, status: 'active' }
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getTrendIcon = (current: number, previous: number) => {
    return current > previous ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Analytics de Email</h2>
        <div className="flex space-x-4">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las cuentas</SelectItem>
              <SelectItem value="main">cuenta@empresa.com</SelectItem>
              <SelectItem value="sales">ventas@empresa.com</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 días</SelectItem>
              <SelectItem value="30d">30 días</SelectItem>
              <SelectItem value="90d">90 días</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Enviados</p>
                <p className="text-2xl font-bold">{formatNumber(kpiData.total_sent)}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Send className="h-4 w-4 text-blue-500" />
                {getTrendIcon(kpiData.total_sent, 220)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Apertura</p>
                <p className="text-2xl font-bold">{formatPercentage(kpiData.open_rate)}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4 text-green-500" />
                {getTrendIcon(kpiData.open_rate, 68.2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Click</p>
                <p className="text-2xl font-bold">{formatPercentage(kpiData.click_rate)}</p>
              </div>
              <div className="flex items-center space-x-1">
                <MousePointer className="h-4 w-4 text-purple-500" />
                {getTrendIcon(kpiData.click_rate, 24.1)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Respuesta</p>
                <p className="text-2xl font-bold">{formatPercentage(kpiData.reply_rate)}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Reply className="h-4 w-4 text-orange-500" />
                {getTrendIcon(kpiData.reply_rate, 11.8)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Email (Últimos 7 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#8884d8" name="Enviados" />
                    <Bar dataKey="opened" fill="#82ca9d" name="Abiertos" />
                    <Bar dataKey="clicked" fill="#ffc658" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="opened" stroke="#8884d8" name="Abiertos" />
                  <Line type="monotone" dataKey="clicked" stroke="#82ca9d" name="Clicks" />
                  <Line type="monotone" dataKey="replied" stroke="#ffc658" name="Respuestas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Templates</CardTitle>
              <CardDescription>
                Análisis del rendimiento de tus templates de email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templatePerformance.map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>Enviados: {template.sent}</span>
                        <span>Abiertos: {template.opened}</span>
                        <span>Clicks: {template.clicked}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatPercentage(template.open_rate)}</p>
                      <p className="text-sm text-muted-foreground">Tasa de apertura</p>
                      <Progress value={template.open_rate} className="w-24 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mejores Campañas</CardTitle>
              <CardDescription>
                Rendimiento de tus campañas de email más exitosas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCampaigns.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status === 'active' ? 'Activa' : 'Completada'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatNumber(campaign.sent)} enviados</span>
                        <span>{formatNumber(campaign.opened)} abiertos</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatPercentage(campaign.open_rate)}</p>
                      <p className="text-sm text-muted-foreground">Tasa de apertura</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mejor Hora de Envío</p>
                    <p className="text-xl font-bold">10:00 AM</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mejor Día</p>
                    <p className="text-xl font-bold">Martes</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contactos Activos</p>
                    <p className="text-xl font-bold">1,247</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Engagement por Tiempo</CardTitle>
              <CardDescription>
                Cuándo tus contactos son más activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="replied" fill="#8884d8" name="Respuestas" />
                  <Bar dataKey="clicked" fill="#82ca9d" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};