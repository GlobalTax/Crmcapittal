import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Euro, TrendingUp, Users, Clock, Download } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { CreateDealDialog } from "@/components/deals/CreateDealDialog";
import { DealsTable } from "@/components/deals/DealsTable";
import { DealsStats } from "@/components/deals/DealsStats";

const Deals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dealOwnerFilter, setDealOwnerFilter] = useState<string>("all");
  const [valueRangeFilter, setValueRangeFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  
  const { deals, loading, error, createDeal, updateDeal, deleteDeal } = useDeals();

  // Get unique deal owners for filter
  const dealOwners = [...new Set(deals.map(deal => deal.deal_owner).filter(Boolean))];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || deal.stage?.name === statusFilter;
    const matchesPriority = priorityFilter === "all" || deal.priority === priorityFilter;
    const matchesOwner = dealOwnerFilter === "all" || deal.deal_owner === dealOwnerFilter;
    
    let matchesValue = true;
    if (valueRangeFilter !== "all" && deal.deal_value) {
      switch (valueRangeFilter) {
        case "0-100k":
          matchesValue = deal.deal_value <= 100000;
          break;
        case "100k-500k":
          matchesValue = deal.deal_value > 100000 && deal.deal_value <= 500000;
          break;
        case "500k-1M":
          matchesValue = deal.deal_value > 500000 && deal.deal_value <= 1000000;
          break;
        case "1M+":
          matchesValue = deal.deal_value > 1000000;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesOwner && matchesValue;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Negocios</h1>
          <p className="text-muted-foreground">
            Gestiona todos tus deals y oportunidades de M&A
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
          >
            {showMetrics ? 'Ocultar' : 'Mostrar'} Métricas
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      {showMetrics && <DealsStats deals={deals} />}

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda Avanzada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar negocios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etapas</SelectItem>
                <SelectItem value="Lead Valoración">Lead Valoración</SelectItem>
                <SelectItem value="Lead Importante">Lead Importante</SelectItem>
                <SelectItem value="Enviado 1r Contacto">Enviado 1r Contacto</SelectItem>
                <SelectItem value="En Contacto">En Contacto</SelectItem>
                <SelectItem value="PSI Enviada">PSI Enviada</SelectItem>
                <SelectItem value="Solicitando Info">Solicitando Info</SelectItem>
                <SelectItem value="Realizando Valoración">Realizando Valoración</SelectItem>
                <SelectItem value="Valoración Entregada">Valoración Entregada</SelectItem>
                <SelectItem value="Lead CV">Lead CV</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dealOwnerFilter} onValueChange={setDealOwnerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Propietario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los propietarios</SelectItem>
                {dealOwners.map((owner) => (
                  <SelectItem key={owner} value={owner!}>
                    {owner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={valueRangeFilter} onValueChange={setValueRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rango de valor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los valores</SelectItem>
                <SelectItem value="0-100k">0 - 100K €</SelectItem>
                <SelectItem value="100k-500k">100K - 500K €</SelectItem>
                <SelectItem value="500k-1M">500K - 1M €</SelectItem>
                <SelectItem value="1M+">1M+ €</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredDeals.length} de {deals.length} negocios
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                Acciones en Masa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      <DealsTable 
        deals={filteredDeals} 
        onUpdate={updateDeal}
        onDelete={deleteDeal}
      />

      {/* Create Deal Dialog */}
      <CreateDealDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(newDeal) => {
          createDeal(newDeal);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};

export default Deals;
