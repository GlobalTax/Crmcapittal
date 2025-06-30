
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Euro, TrendingUp, Users, Clock } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { CreateDealDialog } from "@/components/deals/CreateDealDialog";
import { DealsTable } from "@/components/deals/DealsTable";
import { DealsStats } from "@/components/deals/DealsStats";

const Deals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { deals, loading, error, createDeal, updateDeal, deleteDeal } = useDeals();

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || deal.stage?.name === statusFilter;
    const matchesPriority = priorityFilter === "all" || deal.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Deal
        </Button>
      </div>

      {/* Stats */}
      <DealsStats deals={deals} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, empresa o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
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
