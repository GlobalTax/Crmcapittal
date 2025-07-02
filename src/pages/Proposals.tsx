import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BarChart3, FileText, Filter } from 'lucide-react';
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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando propuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Propuestas Profesional</h1>
          <p className="text-gray-600 mt-1">Gestiona, crea y analiza propuestas de honorarios con herramientas avanzadas</p>
        </div>
        <Button 
          onClick={() => setIsWizardOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Propuesta Profesional
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Propuestas</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Plantillas</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <ProposalDashboard proposals={proposals} />
        </TabsContent>

        <TabsContent value="proposals" className="mt-6 space-y-6">
          {/* Filtros y búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtros y Búsqueda</span>
              </CardTitle>
              <CardDescription>
                Encuentra rápidamente las propuestas que necesitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por título, cliente o empresa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Estado" />
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
            </CardContent>
          </Card>

          {/* Lista de propuestas */}
          <ProposalsTable 
            proposals={filteredProposals} 
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Propuestas</CardTitle>
              <CardDescription>
                Gestiona y crea plantillas reutilizables para tus propuestas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Sistema de Plantillas</h3>
                <p className="text-sm mb-4">
                  Funcionalidad próximamente disponible
                </p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Plantilla
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avanzado</CardTitle>
              <CardDescription>
                Análisis detallado del rendimiento de tus propuestas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Analytics Profesional</h3>
                <p className="text-sm mb-4">
                  Reportes detallados y predicciones próximamente
                </p>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Demo
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
        onSubmit={createProposal}
      />
    </div>
  );
}
