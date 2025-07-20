import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useBuyingMandates } from "@/hooks/useBuyingMandates";
import { CreateMandateDialog } from "@/components/mandates/CreateMandateDialog";
import { ImprovedMandatesTable } from "@/components/mandates/ImprovedMandatesTable";
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Plus, RefreshCw, Target, TrendingUp, Briefcase, Building2 } from "lucide-react";

export default function MandatesPage() {
  const navigate = useNavigate();
  const { mandates, isLoading, fetchMandates } = useBuyingMandates('compra');

  const handleMandateCreated = () => {
    fetchMandates();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando mandatos...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Mandatos de Compra</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los mandatos de búsqueda de empresas para adquisición
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={fetchMandates}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <CreateMandateDialog 
              onSuccess={handleMandateCreated}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Mandato
                </Button>
              }
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mandatos</p>
                <p className="text-2xl font-bold text-foreground">{mandates.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-foreground">
                  {mandates.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold text-foreground">
                  {mandates.filter(m => m.status === 'active' || m.status === 'paused').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(mandates.map(m => m.client_name)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <ImprovedMandatesTable mandates={mandates} onRefresh={fetchMandates} />
      </div>
    </ErrorBoundary>
  );
}