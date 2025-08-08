import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Handshake, 
  Search, 
  PenTool, 
  FileCheck,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import { useReconversionWorkflow } from '@/hooks/useReconversionWorkflow';

interface ReconversionKanbanProps {
  reconversiones: any[];
  onReconversionUpdate?: () => void;
}

interface SubfaseColumn {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const SUBFASE_COLUMNS: SubfaseColumn[] = [
  {
    id: 'prospecting',
    title: 'Prospecting',
    icon: <Search className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800',
    description: 'Búsqueda y calificación de targets'
  },
  {
    id: 'nda',
    title: 'NDA',
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-800',
    description: 'Acuerdo de confidencialidad'
  },
  {
    id: 'loi',
    title: 'LOI',
    icon: <Handshake className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800',
    description: 'Carta de intención'
  },
  {
    id: 'dd',
    title: 'DD',
    icon: <Target className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Due Diligence'
  },
  {
    id: 'signing',
    title: 'Signing',
    icon: <PenTool className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800',
    description: 'Firma y cierre'
  }
];

interface ReconversionCardProps {
  reconversion: any;
  onUpdate?: () => void;
}

function ReconversionCard({ reconversion, onUpdate }: ReconversionCardProps) {
  const { updateSubfase, loading } = useReconversionWorkflow();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'reconversion',
    item: { id: reconversion.id, currentSubfase: reconversion.subfase },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div
      ref={drag}
      className={`cursor-move transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium truncate">
              {reconversion.company_name}
            </CardTitle>
            <Badge className={`text-xs ${getPriorityColor(reconversion.prioridad)}`}>
              {reconversion.prioridad}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {reconversion.contact_name}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            {reconversion.investment_capacity_min && (
              <div className="flex items-center gap-1 text-xs">
                <Target className="h-3 w-3" />
                <span>
                  {formatCurrency(reconversion.investment_capacity_min)}
                  {reconversion.investment_capacity_max && 
                    ` - ${formatCurrency(reconversion.investment_capacity_max)}`
                  }
                </span>
              </div>
            )}
            
            {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                <span className="truncate">
                  {reconversion.target_sectors.slice(0, 2).join(', ')}
                  {reconversion.target_sectors.length > 2 && '...'}
                </span>
              </div>
            )}
            
            {reconversion.fecha_objetivo_cierre && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(reconversion.fecha_objetivo_cierre).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}

            {reconversion.matched_targets_count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {reconversion.matched_targets_count} targets
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface KanbanColumnProps {
  column: SubfaseColumn;
  reconversiones: any[];
  onUpdate?: () => void;
}

function KanbanColumn({ column, reconversiones, onUpdate }: KanbanColumnProps) {
  const { updateSubfase, loading } = useReconversionWorkflow();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'reconversion',
    drop: async (item: { id: string; currentSubfase: string }) => {
      if (item.currentSubfase !== column.id) {
        const success = await updateSubfase(item.id, column.id);
        if (success && onUpdate) {
          onUpdate();
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {column.icon}
          <h3 className="font-semibold">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {reconversiones.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {column.description}
        </p>
      </div>
      
      <div
        ref={drop}
        className={`min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors ${
          isOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted bg-muted/30'
        }`}
      >
        {reconversiones.map((reconversion) => (
          <ReconversionCard
            key={reconversion.id}
            reconversion={reconversion}
            onUpdate={onUpdate}
          />
        ))}
        
        {reconversiones.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No hay reconversiones en esta fase
          </div>
        )}
      </div>
    </div>
  );
}

export function ReconversionKanban({ reconversiones, onReconversionUpdate }: ReconversionKanbanProps) {
  // Agrupar reconversiones por subfase
  const reconversionesBySubfase = SUBFASE_COLUMNS.reduce((acc, column) => {
    acc[column.id] = reconversiones.filter(r => r.subfase === column.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {SUBFASE_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            reconversiones={reconversionesBySubfase[column.id] || []}
            onUpdate={onReconversionUpdate}
          />
        ))}
      </div>
    </div>
  );
}