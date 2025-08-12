
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart3, FileText, Filter, Clock, CheckCircle, XCircle, Search, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { ProposalDashboard } from '@/components/proposals/ProposalDashboard';
import { ProposalWizard } from '@/components/proposals/ProposalWizard';
import { ProposalsTable } from '@/components/proposals/ProposalsTable';

export default function Proposals() {
  const { proposals, loading, createProposal } = useProposals();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.contact?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-muted-foreground bg-muted';
      case 'sent': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      case 'expired': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'in_review': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'expired': return 'Expirada';
      case 'in_review': return 'En Revisión';
      case 'revision_needed': return 'Necesita Revisión';
      default: return status;
    }
  };

  const handleCreateProposal = async (data: any) => {
    await createProposal(data);
  };

  // Calculate stats
  const totalProposals = proposals.length;
  const activeProposals = proposals.filter(p => ['sent', 'in_review'].includes(p.status)).length;
  const approvedProposals = proposals.filter(p => p.status === 'approved').length;
  const totalValue = proposals.reduce((sum, p) => sum + (p.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Cargando propuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="flex justify-end items-center gap-4">
        <Button 
          onClick={() => setIsWizardOpen(true)}
          size="lg"
          className="bg-primary hover:bg-primary/90 shrink-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Propuesta
        </Button>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total</p>
                  <p className="text-3xl font-bold text-blue-900">{totalProposals}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Activas</p>
                  <p className="text-3xl font-bold text-orange-900">{activeProposals}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Aprobadas</p>
                  <p className="text-3xl font-bold text-green-900">{approvedProposals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Valor Total</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(totalValue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1 h-12">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Propuestas</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Plantillas</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-8">
          <ProposalDashboard proposals={proposals} />
        </TabsContent>

        <TabsContent value="proposals" className="mt-8 space-y-6">
          {/* Enhanced Search and Filters */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Buscar y Filtrar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por título, cliente o empresa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="in_review">En Revisión</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                    <SelectItem value="expired">Expirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filter summary */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mostrando {filteredProposals.length} de {totalProposals} propuestas</span>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Proposals Table */}
          <ProposalsTable 
            proposals={filteredProposals} 
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Plantillas de Propuestas
              </CardTitle>
              <CardDescription>
                Gestiona y crea plantillas reutilizables para agilizar tus propuestas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sin plantillas aún</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Crea plantillas para acelerar el proceso de creación de propuestas y mantener consistencia en tu marca.
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics y Reportes
              </CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento y efectividad de tus propuestas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Analytics Avanzado</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Obtén insights sobre tasas de conversión, tiempos de respuesta y oportunidades de mejora.
                </p>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Demo de Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wizard Dialog */}
      <ProposalWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateProposal}
      />
    </div>
  );
}
