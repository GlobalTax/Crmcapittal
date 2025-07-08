import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { MandateTarget } from '@/types/BuyingMandate';
import { TargetPipelineCard } from './TargetPipelineCard';

interface TargetPipelineColumnProps {
  id: string;
  title: string;
  targets: MandateTarget[];
  onTargetClick: (target: MandateTarget) => void;
}

const getColumnColor = (id: string) => {
  const colors = {
    pending: 'bg-gray-50 border-gray-200',
    contacted: 'bg-blue-50 border-blue-200',
    interested: 'bg-green-50 border-green-200',
    nda_signed: 'bg-purple-50 border-purple-200',
    rejected: 'bg-red-50 border-red-200',
  };
  return colors[id as keyof typeof colors] || 'bg-gray-50 border-gray-200';
};

const getBadgeVariant = (id: string) => {
  const variants = {
    pending: 'secondary' as const,
    contacted: 'default' as const,
    interested: 'default' as const,
    nda_signed: 'default' as const,
    rejected: 'destructive' as const,
  };
  return variants[id as keyof typeof variants] || 'secondary';
};

export const TargetPipelineColumn = ({
  id,
  title,
  targets,
  onTargetClick,
}: TargetPipelineColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const totalValue = targets.reduce((sum, target) => {
    return sum + (target.revenues || target.ebitda || 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[600px] w-80 rounded-lg border-2 transition-colors ${
        isOver ? 'border-primary bg-primary/5' : getColumnColor(id)
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{title}</h3>
          <Badge variant={getBadgeVariant(id)} className="text-xs">
            {targets.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-muted-foreground">
            Valor total: {formatCurrency(totalValue)}
          </p>
        )}
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <SortableContext items={targets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {targets.map((target) => (
            <TargetPipelineCard
              key={target.id}
              target={target}
              onClick={() => onTargetClick(target)}
            />
          ))}
        </SortableContext>

        {targets.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Sin targets</p>
          </div>
        )}
      </div>
    </div>
  );
};