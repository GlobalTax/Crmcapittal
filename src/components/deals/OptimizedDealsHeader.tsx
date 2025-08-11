import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Search, TrendingUp, Target, Calendar } from 'lucide-react';

interface DealsHeaderProps {
  onNewDeal: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedOwner: string;
  onOwnerChange: (value: string) => void;
  quickFilters: string[];
  onQuickFilterToggle: (filter: string) => void;
  timePeriod: string;
  onTimePeriodChange: (value: string) => void;
}

interface DealStats {
  pipelineValue: number;
  dealsClosedThisMonth: number;
  winRate: number;
}

export const OptimizedDealsHeader = ({
  onNewDeal,
  searchTerm,
  onSearchChange,
  selectedOwner,
  onOwnerChange,
  quickFilters,
  onQuickFilterToggle,
  timePeriod,
  onTimePeriodChange
}: DealsHeaderProps) => {
  // Mock stats - in real implementation, these would come from a hook
  const stats: DealStats = {
    pipelineValue: 2450000,
    dealsClosedThisMonth: 12,
    winRate: 68
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const quickFilterOptions = [
    { id: 'mine', label: 'Míos', icon: null },
    { id: 'closing-soon', label: 'Cierre próximo', icon: Calendar },
    { id: 'high-priority', label: 'Alta prioridad', icon: Target },
    { id: 'no-activity', label: 'Sin actividad', icon: null },
  ];

  return (
    <div className="border-b border-border bg-background">
      <div className="p-6">
        {/* Top Section: Title & Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Pipeline de Deals</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona tus oportunidades de venta con estilo HubSpot
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex items-center gap-4">
            <Card className="px-4 py-3 bg-primary/5 border-primary/20">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">
                  {formatCurrency(stats.pipelineValue)}
                </div>
                <div className="text-xs text-muted-foreground">Valor Pipeline</div>
              </div>
            </Card>
            
            <Card className="px-4 py-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {stats.dealsClosedThisMonth}
                </div>
                <div className="text-xs text-muted-foreground">Cerrados/mes</div>
              </div>
            </Card>
            
            <Card className="px-4 py-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {stats.winRate}%
                </div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Search, Filters & Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search & Filters */}
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar deals..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>

            {/* Owner Filter */}
            <Select value={selectedOwner} onValueChange={onOwnerChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Propietario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="me">Yo</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
              </SelectContent>
            </Select>

            {/* Time Period */}
            <Select value={timePeriod} onValueChange={onTimePeriodChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">Este mes</SelectItem>
                <SelectItem value="this-quarter">Este trimestre</SelectItem>
                <SelectItem value="this-year">Este año</SelectItem>
                <SelectItem value="all">Todo el tiempo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Center: Quick Filters */}
          <div className="flex items-center gap-2">
            {quickFilterOptions.map((filter) => {
              const isActive = quickFilters.includes(filter.id);
              const Icon = filter.icon;
              
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onQuickFilterToggle(filter.id)}
                  className={`h-8 text-xs ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                >
                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                  {filter.label}
                  {isActive && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      ×
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Right: New Deal Button */}
          <Button 
            onClick={onNewDeal}
            variant="default"
            className="font-medium px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Deal
          </Button>
        </div>
      </div>
    </div>
  );
};