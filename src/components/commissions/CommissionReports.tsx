import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  FileDown,
  Mail
} from 'lucide-react';
import { useCommissions } from '@/hooks/useCommissions';
import { useCommissionStats } from '@/hooks/useCommissionStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  collaboratorId: string | null;
  calculationType: string | null;
  status: string | null;
  recipientType: string | null;
}

export const CommissionReports = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    collaboratorId: null,
    calculationType: null,
    status: null,
    recipientType: null
  });

  const { commissions, loading } = useCommissions();
  const { stats } = useCommissionStats();

  // Filter commissions based on filters
  const filteredCommissions = commissions.filter(commission => {
    if (filters.startDate && new Date(commission.created_at) < filters.startDate) return false;
    if (filters.endDate && new Date(commission.created_at) > filters.endDate) return false;
    if (filters.collaboratorId && commission.collaborator_id !== filters.collaboratorId) return false;
    if (filters.calculationType && commission.calculation_details?.calculation_type !== filters.calculationType) return false;
    if (filters.status && commission.status !== filters.status) return false;
    if (filters.recipientType && commission.recipient_type !== filters.recipientType) return false;
    return true;
  });

  // Generate report data
  const reportData = {
    totalCommissions: filteredCommissions.length,
    totalAmount: filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0),
    avgAmount: filteredCommissions.length > 0 ? filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0) / filteredCommissions.length : 0,
    byStatus: filteredCommissions.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byRecipientType: filteredCommissions.reduce((acc, c) => {
      acc[c.recipient_type] = (acc[c.recipient_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byCalculationType: filteredCommissions.reduce((acc, c) => {
      const calcType = c.calculation_details?.calculation_type || 'Sin definir';
      acc[calcType] = (acc[calcType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    lowMarginAlerts: filteredCommissions.filter(c => {
      const margin = c.calculation_details?.net_profit_margin;
      return margin && margin < 15;
    }).length
  };

  // Chart data
  const statusChartData = Object.entries(reportData.byStatus).map(([key, value]) => ({
    name: key === 'pending' ? 'Pendiente' : key === 'approved' ? 'Aprobada' : key === 'paid' ? 'Pagada' : key,
    value
  }));

  const recipientTypeChartData = Object.entries(reportData.byRecipientType).map(([key, value]) => ({
    name: key === 'collaborator' ? 'Colaborador' : 'Empleado',
    value
  }));

  const monthlyTrend = filteredCommissions.reduce((acc, c) => {
    const month = format(new Date(c.created_at), 'MMM yyyy', { locale: es });
    acc[month] = (acc[month] || 0) + c.commission_amount;
    return acc;
  }, {} as Record<string, number>);

  const trendChartData = Object.entries(monthlyTrend).map(([month, amount]) => ({
    month,
    amount
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  // Export functions
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Reporte de Comisiones'],
      ['Período', `${filters.startDate ? format(filters.startDate, 'dd/MM/yyyy') : 'Inicio'} - ${filters.endDate ? format(filters.endDate, 'dd/MM/yyyy') : 'Fin'}`],
      [''],
      ['Resumen Ejecutivo'],
      ['Total de Comisiones', reportData.totalCommissions],
      ['Importe Total', `€${reportData.totalAmount.toLocaleString()}`],
      ['Importe Promedio', `€${reportData.avgAmount.toLocaleString()}`],
      ['Alertas de Margen Bajo', reportData.lowMarginAlerts],
      ['']
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

    // Detailed data sheet
    const detailedData = filteredCommissions.map(c => ({
      'ID': c.id,
      'Fecha': format(new Date(c.created_at), 'dd/MM/yyyy'),
      'Destinatario': c.recipient_name || 'Sin especificar',
      'Tipo': c.recipient_type === 'collaborator' ? 'Colaborador' : 'Empleado',
      'Fuente': c.source_name || 'Sin especificar',
      'Importe': c.commission_amount,
      'Estado': c.status,
      'Tipo Cálculo': c.calculation_details?.calculation_type || 'Sin definir',
      'Margen': c.calculation_details?.net_profit_margin ? `${c.calculation_details.net_profit_margin}%` : 'N/A'
    }));
    
    const ws2 = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle');

    XLSX.writeFile(wb, `reporte-comisiones-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Reporte de Comisiones', 20, 20);
    
    // Period
    doc.setFontSize(12);
    doc.text(`Período: ${filters.startDate ? format(filters.startDate, 'dd/MM/yyyy') : 'Inicio'} - ${filters.endDate ? format(filters.endDate, 'dd/MM/yyyy') : 'Fin'}`, 20, 35);
    
    // Summary table
    const summaryTableData = [
      ['Métrica', 'Valor'],
      ['Total de Comisiones', reportData.totalCommissions.toString()],
      ['Importe Total', `€${reportData.totalAmount.toLocaleString()}`],
      ['Importe Promedio', `€${reportData.avgAmount.toLocaleString()}`],
      ['Alertas de Margen Bajo', reportData.lowMarginAlerts.toString()]
    ];
    
    (doc as any).autoTable({
      head: [summaryTableData[0]],
      body: summaryTableData.slice(1),
      startY: 50,
      theme: 'grid'
    });

    // Detailed table
    const tableData = filteredCommissions.slice(0, 20).map(c => [
      format(new Date(c.created_at), 'dd/MM/yyyy'),
      c.recipient_name || 'Sin especificar',
      c.recipient_type === 'collaborator' ? 'Colaborador' : 'Empleado',
      `€${c.commission_amount.toLocaleString()}`,
      c.status,
      c.calculation_details?.calculation_type || 'Sin definir'
    ]);

    (doc as any).autoTable({
      head: [['Fecha', 'Destinatario', 'Tipo', 'Importe', 'Estado', 'Cálculo']],
      body: tableData,
      startY: (doc as any).lastAutoTable.finalY + 20,
      theme: 'grid'
    });

    doc.save(`reporte-comisiones-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const scheduleReport = () => {
    // TODO: Implement scheduled reports
    alert('Funcionalidad de reportes programados próximamente');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
          <CardDescription>
            Personaliza los datos que quieres incluir en tu reporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate || undefined}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date || null }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate || undefined}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date || null }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? null : value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="paid">Pagada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Type Filter */}
            <div className="space-y-2">
              <Label>Tipo de destinatario</Label>
              <Select
                value={filters.recipientType || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, recipientType: value === 'all' ? null : value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                  <SelectItem value="employee">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Calculation Type Filter */}
            <div className="space-y-2">
              <Label>Tipo de cálculo</Label>
              <Select
                value={filters.calculationType || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, calculationType: value === 'all' ? null : value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="gross_revenue">Facturación Bruta</SelectItem>
                  <SelectItem value="net_profit">Beneficio Neto</SelectItem>
                  <SelectItem value="mixed">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={exportToExcel} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={scheduleReport} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Programar Reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Comisiones</p>
                <p className="text-2xl font-bold">{reportData.totalCommissions}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Importe Total</p>
                <p className="text-2xl font-bold">€{reportData.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold">€{reportData.avgAmount.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Margen</p>
                <p className="text-2xl font-bold text-destructive">{reportData.lowMarginAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recipient Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recipientTypeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Importe']} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado</CardTitle>
          <CardDescription>
            Insights clave del período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Por Tipo de Cálculo</h4>
              <div className="space-y-1">
                {Object.entries(reportData.byCalculationType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <Badge variant="outline">{type}</Badge>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Alertas de Rentabilidad</h4>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Márgenes &lt; 15%</span>
                  <Badge variant="destructive">{reportData.lowMarginAlerts}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Márgenes saludables</span>
                  <Badge variant="secondary">{reportData.totalCommissions - reportData.lowMarginAlerts}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recomendaciones</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {reportData.lowMarginAlerts > 0 && (
                  <p>• Revisar comisiones con margen bajo</p>
                )}
                {reportData.totalAmount > 10000 && (
                  <p>• Considerar automatización de pagos</p>
                )}
                <p>• Programar reportes mensuales</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};