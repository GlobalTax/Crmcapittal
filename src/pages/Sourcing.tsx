
import { TargetCompaniesTable } from "@/components/sourcing/TargetCompaniesTable";
import { KanbanPipeline } from "@/components/sourcing/KanbanPipeline";
import { CreateTargetCompanyDialog } from "@/components/sourcing/CreateTargetCompanyDialog";
import { BulkImportDialog } from "@/components/sourcing/BulkImportDialog";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Target, LayoutGrid, Table } from "lucide-react";
import { useState } from "react";

const Sourcing = () => {
  const { targetCompanies, loading } = useTargetCompanies();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Calculate stats
  const totalTargets = targetCompanies.length;
  const activeTargets = targetCompanies.filter(t => !['ARCHIVED', 'CONVERTED_TO_DEAL'].includes(t.status)).length;
  const convertedTargets = targetCompanies.filter(t => t.status === 'CONVERTED_TO_DEAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8" />
            Universo de Búsqueda
          </h2>
          <p className="text-muted-foreground">
            Gestiona y convierte empresas objetivo en oportunidades de inversión.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg border p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
            >
              <Table className="h-4 w-4 mr-1" />
              Tabla
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Kanban
            </Button>
          </div>

          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Importar CSV</span>
          </Button>
          
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Empresa</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Objetivos</p>
              <p className="text-2xl font-bold text-black">{totalTargets}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-black">{activeTargets}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Convertidos</p>
              <p className="text-2xl font-bold text-black">{convertedTargets}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Toggle between Table and Kanban */}
      {viewMode === 'table' ? (
        <TargetCompaniesTable />
      ) : (
        <KanbanPipeline onToggleView={() => setViewMode('table')} />
      )}

      {/* Dialogs */}
      <CreateTargetCompanyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <BulkImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
};

export default Sourcing;
