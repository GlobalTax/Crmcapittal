/**
 * Commission Reports - Refactored Component
 * 
 * Now uses feature-based architecture with separated concerns
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileSpreadsheet,
  FileDown,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react';
import { useCommissionReports } from '@/features/commissions/hooks/useCommissionReports';
import { ReportFilters } from '@/features/commissions/components/ReportFilters';
import { ReportCharts } from '@/features/commissions/components/ReportCharts';
import { Badge } from '@/components/ui/badge';

export const CommissionReports = () => {
  const {
    data: filteredData,
    isLoading,
    filters,
    updateFilters,
    clearFilters,
    applyFilters,
    stats,
    chartData,
    exportToExcel,
    exportToPDF
  } = useCommissionReports();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Comisiones</h1>
          <p className="text-muted-foreground">
            Análisis y exportación de datos de comisiones
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => exportToExcel()} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button 
            onClick={() => exportToPDF()}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCommissions.toLocaleString('es-ES', { 
                style: 'currency', 
                currency: 'EUR' 
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Deal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgCommission.toLocaleString('es-ES', { 
                style: 'currency', 
                currency: 'EUR' 
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />

      {/* Charts */}
      <ReportCharts data={chartData} />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Datos de Comisiones ({filteredData.length})</CardTitle>
          <CardDescription>
            Listado detallado de comisiones según los filtros aplicados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron comisiones con los filtros aplicados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Colaborador</th>
                    <th className="text-left p-2">Monto Deal</th>
                    <th className="text-left p-2">Porcentaje</th>
                    <th className="text-left p-2">Comisión</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((commission) => (
                    <tr key={commission.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{commission.collaborator_name}</td>
                      <td className="p-2">
                        {commission.amount.toLocaleString('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </td>
                      <td className="p-2">{commission.commission_percentage}%</td>
                      <td className="p-2 font-medium">
                        {commission.commission_amount.toLocaleString('es-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={commission.status === 'paid' ? 'default' : 'secondary'}
                        >
                          {commission.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {new Date(commission.created_at).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};