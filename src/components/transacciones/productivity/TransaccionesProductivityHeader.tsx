import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Users, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useTransaccionesOptimized } from '@/hooks/useTransaccionesOptimized';

interface QuickFilter {
  key: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

export const TransaccionesProductivityHeader: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedValueRange, setSelectedValueRange] = useState<string>('all');
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const { stats, isLoading: loading } = useTransaccionesOptimized({
    search: searchTerm,
    owner: selectedOwner,
    stage: selectedStage,
    valueRange: selectedValueRange,
    quickFilters: activeQuickFilters
  });

  const quickFilters: QuickFilter[] = [
    { key: 'mias', label: 'Míos', icon: <Users className="h-3 w-3" />, active: activeQuickFilters.includes('mias') },
    { key: 'cierre_proximo', label: 'Cierre próximo', icon: <TrendingUp className="h-3 w-3" />, active: activeQuickFilters.includes('cierre_proximo') },
    { key: 'sin_actividad', label: 'Sin actividad 7d+', icon: <Clock className="h-3 w-3" />, active: activeQuickFilters.includes('sin_actividad') },
    { key: 'urgentes', label: 'Urgentes', icon: <AlertTriangle className="h-3 w-3" />, active: activeQuickFilters.includes('urgentes') }
  ];

  const toggleQuickFilter = (filterKey: string) => {
    setActiveQuickFilters(prev => 
      prev.includes(filterKey) 
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transacciones</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total Pipeline</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : formatCurrency(stats?.totalValue || 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transacciones Activas</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : stats?.activeCount || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cierre Próximo (30d)</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : stats?.closingSoonCount || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sin Actividad 7d+</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? '...' : stats?.inactiveCount || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda Inteligente */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, valor >500K, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros Core */}
            <div className="flex flex-wrap gap-3">
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Propietario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="me">Yo</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedValueRange} onValueChange={setSelectedValueRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Valor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="high">{">"} 1M €</SelectItem>
                  <SelectItem value="medium">500K - 1M €</SelectItem>
                  <SelectItem value="low">{"<"} 500K €</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quickFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant={filter.active ? "default" : "outline"}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  filter.active ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => toggleQuickFilter(filter.key)}
              >
                {filter.icon}
                <span className="ml-1">{filter.label}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};