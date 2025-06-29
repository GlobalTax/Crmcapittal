
import { useState } from "react";
import { OperacionesKanban } from "@/components/operaciones/OperacionesKanban";
import { OperacionesTable } from "@/components/operaciones/OperacionesTable";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

type ViewMode = 'pipeline' | 'table';

export default function Operaciones() {
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');

  return (
    <div className="w-full max-w-[1280px] mx-auto px-8 py-8">
      {/* Header de la página */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Pipeline de Operaciones</h1>
        
        {/* Selector de Vista */}
        <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          <Button
            variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('pipeline')}
            className={`flex items-center gap-2 ${
              viewMode === 'pipeline' 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Pipeline
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 ${
              viewMode === 'table' 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table className="h-4 w-4" />
            Tabla
          </Button>
        </div>
      </div>

      {/* Contenido Principal */}
      {viewMode === 'pipeline' ? (
        <OperacionesKanban />
      ) : (
        <OperacionesTable />
      )}
    </div>
  );
}
